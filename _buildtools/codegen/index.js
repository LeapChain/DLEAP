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
    }export type ${modelName} = ${typescriptTypeS(model)};`;
  }
  fs.writeFile("./javascript/src/models/generated.ts", output, "utf8").then(
    () => {
      console.info(
        "Successfully generated JavaScript models in './javascript/src/models/generated.ts'."
      );
    }
  );
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
