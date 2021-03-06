/// <reference path="./index.js" />

/** @type {Record<string, JSONSchemaValue & { type: "object" }>} */
const models = {
  PrimaryValidatorInfo: {
    doc: "The nested primary validator info within a bank node's config.",
    type: "object",
    properties: {
      account_number: { type: "string" },
      ip_address: { type: "string" },
      node_identifier: { type: "string" },
      port: { type: "integer" },
      protocol: { type: "string" },
      version: { type: "string" },
      default_transaction_fee: { type: "float" },
      root_account_file: { type: "string" },
      root_account_file_hash: { type: "string" },
      seed_block_identifier: { type: "string" },
      daily_confirmation_rate: { type: "float" },
      trust: { type: "string" },
    },
    requiredProperties: [
      "account_number",
      "ip_address",
      "node_identifier",
      "port",
      "protocol",
      "version",
      "default_transaction_fee",
      "root_account_file",
      "root_account_file_hash",
      "seed_block_identifier",
      "daily_confirmation_rate",
      "trust",
    ],
  },
  BankConfig: {
    doc: "The config of a bank node.",
    type: "object",
    properties: {
      primary_validator: { type: "ref", name: "PrimaryValidatorInfo" },
      account_number: { type: "string" },
      ip_address: { type: "string" },
      node_identifier: { type: "string" },
      port: { type: "integer" },
      protocol: { type: "string" },
      version: { type: "string" },
      default_transaction_fee: { type: "float" },
      node_type: { type: "string" },
    },
    requiredProperties: [
      "primary_validator",
      "account_number",
      "ip_address",
      "node_identifier",
      "port",
      "protocol",
      "version",
      "default_transaction_fee",
      "node_type",
    ],
  },
  PrimaryValidatorConfig: {
    doc: "The config of a primary validator node.",
    type: "object",
    properties: {
      // primary_validator: null
      account_number: { type: "string" },
      ip_address: { type: "string" },
      node_identifier: {
        doc: "The public key associated with the primary validator node on the network.",
        type: "string",
      },
      port: { type: "integer" },
      protocol: { type: "string" },
      version: { type: "string" },
      default_transaction_fee: { type: "float" },
      root_account_file: { type: "string" },
      root_account_file_hash: { type: "string" },
      seed_block_identifier: { type: "string" },
      daily_confirmation_rate: { type: "float" },
      node_type: { type: "string" },
    },
    requiredProperties: [
      "account_number",
      "ip_address",
      "node_identifier",
      "port",
      "protocol",
      "version",
      "default_transaction_fee",
      "root_account_file",
      "root_account_file_hash",
      "seed_block_identifier",
      "daily_confirmation_rate",
      "node_type",
    ],
  },
};

module.exports = models;
