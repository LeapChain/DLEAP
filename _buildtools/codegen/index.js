const models = require("./models");
const targets = require("../../targets.json");
const fs = require("fs/promises");
const utils = require("./utils");

/** @typedef {({ type: "boolean" | "string" | "number" | "float" | "integer" } | { type: "ref"; name: string } | { type: "object"; properties: Record<string, JSONSchemaValue & { type: Exclude<JSONSchemaValue["type"], "object"> }>; requiredProperties?: string[] }) & { doc?: string }} JSONSchemaValue */

/**
 * @param {JSONSchemaValue} schema
 * @returns {string}
 */
function typescriptTypeS(schema) {
  switch (schema.type) {
    case "ref":
      return schema.name;
    case "string":
    case "number":
    case "boolean":
      return schema.type;
    case "integer":
    case "float":
      return "number";
    case "object": {
      return `{${Object.entries(schema.properties)
        .map(
          ([prop, val]) =>
            `${val.doc !== undefined ? `/** ${val.doc} */` : ""}${prop}${
              schema.requiredProperties?.includes(prop) ? "" : "?"
            }:${typescriptTypeS(val)}`
        )
        .join(";")}}`;
    }
  }
}

/**
 * @param {JSONSchemaValue} schema
 * @returns {string}
 */
function rustTypeS(schema) {
  switch (schema.type) {
    case "ref":
      return schema.name;
    case "string":
      return "String";
    case "integer":
      return "i32";
    case "float":
      return "f32";
    case "boolean":
      return "bool";
    case "object":
      return `{${Object.entries(schema.properties)
        .map(([prop, val]) => {
          const nested = rustTypeS(val);
          return `${
            val.doc !== undefined ? `/// ${val.doc}\n` : ""
          }pub ${prop}:${
            schema.requiredProperties?.includes(prop)
              ? nested
              : `Option<${nested}>`
          }`;
        })
        .join(",")}}`;
    default:
      throw new SyntaxError(`'${schema.type}' is not a valid type.`);
  }
}

/**
 * @param {JSONSchemaValue} schema
 * @returns {string}
 */
function goTypeS(schema) {
  switch (schema.type) {
    case "ref":
      return schema.name;
    case "string":
      return "string";
    case "integer":
      return "int32";
    case "float":
      return "float32";
    case "boolean":
      return "bool";
    case "object":
      return `{${Object.entries(schema.properties)
        .map(([prop, val]) => {
          const nested = goTypeS(val);
          return `${
            val.doc !== undefined ? `// ${val.doc}\n` : ""
          }${utils.snakeToPascal(prop)} ${
            schema.requiredProperties?.includes(prop) ? "" : "*"
          }${nested} \`json:"${prop}"\``;
        })
        .join("\n")}}`;
    default:
      throw new SyntaxError(`'${schema.type}' is not a valid type.`);
  }
}

/**
 * @param {JSONSchemaValue} schema
 * @param {string | undefined} name
 * @returns {string}
 */
function dartTypeS(schema, name) {
  switch (schema.type) {
    case "ref":
      return schema.name;
    case "string":
      return "String";
    case "integer":
      return "int";
    case "float":
      return "double";
    case "boolean":
      return "bool";
    case "object":
      const isRequired = (name) => schema.requiredProperties?.includes(name);

      const generatedProps = Object.entries(schema.properties).map(
        ([name, model]) => [
          name,
          {
            code: dartTypeS(model),
            data: model,
          },
        ]
      );

      return `{${generatedProps
        .map(([prop, { code: nested, data: val }]) => {
          return `${
            val.doc !== undefined ? `/// ${val.doc}\n` : ""
          }final ${nested}${isRequired(prop) ? "" : "?"} ${utils.snakeToCamel(
            prop
          )};`;
        })
        .join("")}const ${name}({${generatedProps
        .map(
          ([prop, _]) =>
            `${isRequired(prop) ? "required " : ""}this.${utils.snakeToCamel(
              prop
            )}`
        )
        .join(
          ","
        )}});factory ${name}.fromJson(Map<String, dynamic> json) => ${name}(${generatedProps
        .map(([prop, { code: nested, data: model }]) => {
          const raw = `json['${prop}']`;
          const required = isRequired(prop);
          const casted =
            model.type === "ref"
              ? `${model.name}.fromJson(${raw})`
              : `${raw} as ${nested}`;
          return `${utils.snakeToCamel(prop)}:${
            required ? casted : `${raw} == null ? null : ${casted}`
          }`;
        })
        .join(",")});Map<String, dynamic> toJson() => {${generatedProps
        .map(([prop, { data }]) => {
          return `'${prop}':${utils.snakeToCamel(prop)}${
            data.type === "ref" ? ".toJson()" : ""
          }`;
        })
        .join(",")}};}`;
    default:
      throw new SyntaxError(`'${schema.type}' is not a valid type.`);
  }
}

let targetNames = Object.keys(targets).filter((name) => name !== "$schema");

if (process.argv[2] !== "%npm_config_targets%") {
  const passedIn = process.argv[2].split(",");
  targetNames = targetNames.filter((name) => passedIn.includes(name));
}

if (targetNames.includes("javascript")) {
  let output = "// prettier-ignore\n";
  for (const [modelName, model] of Object.entries(models)) {
    output += `${
      model.doc !== undefined ? `/** ${model.doc} */` : ""
    }export type ${modelName} = ${typescriptTypeS(model, modelName)};`;
  }
  fs.writeFile("./javascript/src/models/generated.ts", output, "utf8").then(
    () => {
      console.info(
        "Successfully generated JavaScript models in './javascript/src/models/generated.ts'."
      );
    }
  );
}

if (targetNames.includes("dart")) {
  let output = "";
  for (const [modelName, model] of Object.entries(models)) {
    output += `${
      model.doc !== undefined ? `/// ${model.doc}\n` : ""
    }class ${modelName} ${dartTypeS(model, modelName)}`;
  }
  fs.writeFile("./dart/lib/src/models.g.dart", output, "utf8").then(() => {
    console.info(
      "Successfully generated Dart models in './dart/lib/src/models.g.dart'."
    );
  });
}

if (targetNames.includes("rust")) {
  let output = "use serde::{Serialize, Deserialize};\n";
  for (const [modelName, model] of Object.entries(models)) {
    output += `${
      model.doc !== undefined ? `/// ${model.doc}\n` : ""
    }#[derive(Debug, Serialize, Deserialize)]pub struct ${modelName}${rustTypeS(
      model
    )}`;
  }
  fs.writeFile("./rust/src/models.rs", output, "utf8").then(() => {
    console.info(
      "Successfully generated Rust models in './rust/src/models.rs'."
    );
  });
}

if (targetNames.includes("golang")) {
  let output = "package dtnb\n";
  for (const [modelName, model] of Object.entries(models)) {
    output += `${
      model.doc !== undefined ? `// ${model.doc}\n` : ""
    }type ${modelName} struct ${goTypeS(model)}`;
  }
  fs.writeFile("./golang/models.go", output, "utf8").then(() => {
    console.info(
      "Successfully generated Golang models in './golang/models.go'."
    );
  });
}
