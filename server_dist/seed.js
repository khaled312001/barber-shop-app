"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except2, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except2)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/dotenv/package.json
var require_package = __commonJS({
  "node_modules/dotenv/package.json"(exports2, module2) {
    module2.exports = {
      name: "dotenv",
      version: "16.4.7",
      description: "Loads environment variables from .env file",
      main: "lib/main.js",
      types: "lib/main.d.ts",
      exports: {
        ".": {
          types: "./lib/main.d.ts",
          require: "./lib/main.js",
          default: "./lib/main.js"
        },
        "./config": "./config.js",
        "./config.js": "./config.js",
        "./lib/env-options": "./lib/env-options.js",
        "./lib/env-options.js": "./lib/env-options.js",
        "./lib/cli-options": "./lib/cli-options.js",
        "./lib/cli-options.js": "./lib/cli-options.js",
        "./package.json": "./package.json"
      },
      scripts: {
        "dts-check": "tsc --project tests/types/tsconfig.json",
        lint: "standard",
        pretest: "npm run lint && npm run dts-check",
        test: "tap run --allow-empty-coverage --disable-coverage --timeout=60000",
        "test:coverage": "tap run --show-full-coverage --timeout=60000 --coverage-report=lcov",
        prerelease: "npm test",
        release: "standard-version"
      },
      repository: {
        type: "git",
        url: "git://github.com/motdotla/dotenv.git"
      },
      funding: "https://dotenvx.com",
      keywords: [
        "dotenv",
        "env",
        ".env",
        "environment",
        "variables",
        "config",
        "settings"
      ],
      readmeFilename: "README.md",
      license: "BSD-2-Clause",
      devDependencies: {
        "@types/node": "^18.11.3",
        decache: "^4.6.2",
        sinon: "^14.0.1",
        standard: "^17.0.0",
        "standard-version": "^9.5.0",
        tap: "^19.2.0",
        typescript: "^4.8.4"
      },
      engines: {
        node: ">=12"
      },
      browser: {
        fs: false
      }
    };
  }
});

// node_modules/dotenv/lib/main.js
var require_main = __commonJS({
  "node_modules/dotenv/lib/main.js"(exports2, module2) {
    var fs = require("fs");
    var path2 = require("path");
    var os = require("os");
    var crypto2 = require("crypto");
    var packageJson = require_package();
    var version2 = packageJson.version;
    var LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;
    function parse(src) {
      const obj = {};
      let lines = src.toString();
      lines = lines.replace(/\r\n?/mg, "\n");
      let match;
      while ((match = LINE.exec(lines)) != null) {
        const key = match[1];
        let value = match[2] || "";
        value = value.trim();
        const maybeQuote = value[0];
        value = value.replace(/^(['"`])([\s\S]*)\1$/mg, "$2");
        if (maybeQuote === '"') {
          value = value.replace(/\\n/g, "\n");
          value = value.replace(/\\r/g, "\r");
        }
        obj[key] = value;
      }
      return obj;
    }
    function _parseVault(options) {
      const vaultPath = _vaultPath(options);
      const result = DotenvModule.configDotenv({ path: vaultPath });
      if (!result.parsed) {
        const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
        err.code = "MISSING_DATA";
        throw err;
      }
      const keys = _dotenvKey(options).split(",");
      const length = keys.length;
      let decrypted;
      for (let i = 0; i < length; i++) {
        try {
          const key = keys[i].trim();
          const attrs = _instructions(result, key);
          decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);
          break;
        } catch (error) {
          if (i + 1 >= length) {
            throw error;
          }
        }
      }
      return DotenvModule.parse(decrypted);
    }
    function _log(message) {
      console.log(`[dotenv@${version2}][INFO] ${message}`);
    }
    function _warn(message) {
      console.log(`[dotenv@${version2}][WARN] ${message}`);
    }
    function _debug(message) {
      console.log(`[dotenv@${version2}][DEBUG] ${message}`);
    }
    function _dotenvKey(options) {
      if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
        return options.DOTENV_KEY;
      }
      if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
        return process.env.DOTENV_KEY;
      }
      return "";
    }
    function _instructions(result, dotenvKey) {
      let uri;
      try {
        uri = new URL(dotenvKey);
      } catch (error) {
        if (error.code === "ERR_INVALID_URL") {
          const err = new Error("INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        }
        throw error;
      }
      const key = uri.password;
      if (!key) {
        const err = new Error("INVALID_DOTENV_KEY: Missing key part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environment = uri.searchParams.get("environment");
      if (!environment) {
        const err = new Error("INVALID_DOTENV_KEY: Missing environment part");
        err.code = "INVALID_DOTENV_KEY";
        throw err;
      }
      const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
      const ciphertext = result.parsed[environmentKey];
      if (!ciphertext) {
        const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
        err.code = "NOT_FOUND_DOTENV_ENVIRONMENT";
        throw err;
      }
      return { ciphertext, key };
    }
    function _vaultPath(options) {
      let possibleVaultPath = null;
      if (options && options.path && options.path.length > 0) {
        if (Array.isArray(options.path)) {
          for (const filepath of options.path) {
            if (fs.existsSync(filepath)) {
              possibleVaultPath = filepath.endsWith(".vault") ? filepath : `${filepath}.vault`;
            }
          }
        } else {
          possibleVaultPath = options.path.endsWith(".vault") ? options.path : `${options.path}.vault`;
        }
      } else {
        possibleVaultPath = path2.resolve(process.cwd(), ".env.vault");
      }
      if (fs.existsSync(possibleVaultPath)) {
        return possibleVaultPath;
      }
      return null;
    }
    function _resolveHome(envPath) {
      return envPath[0] === "~" ? path2.join(os.homedir(), envPath.slice(1)) : envPath;
    }
    function _configVault(options) {
      _log("Loading env from encrypted .env.vault");
      const parsed = DotenvModule._parseVault(options);
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsed, options);
      return { parsed };
    }
    function configDotenv(options) {
      const dotenvPath = path2.resolve(process.cwd(), ".env");
      let encoding = "utf8";
      const debug = Boolean(options && options.debug);
      if (options && options.encoding) {
        encoding = options.encoding;
      } else {
        if (debug) {
          _debug("No encoding is specified. UTF-8 is used by default");
        }
      }
      let optionPaths = [dotenvPath];
      if (options && options.path) {
        if (!Array.isArray(options.path)) {
          optionPaths = [_resolveHome(options.path)];
        } else {
          optionPaths = [];
          for (const filepath of options.path) {
            optionPaths.push(_resolveHome(filepath));
          }
        }
      }
      let lastError;
      const parsedAll = {};
      for (const path3 of optionPaths) {
        try {
          const parsed = DotenvModule.parse(fs.readFileSync(path3, { encoding }));
          DotenvModule.populate(parsedAll, parsed, options);
        } catch (e) {
          if (debug) {
            _debug(`Failed to load ${path3} ${e.message}`);
          }
          lastError = e;
        }
      }
      let processEnv = process.env;
      if (options && options.processEnv != null) {
        processEnv = options.processEnv;
      }
      DotenvModule.populate(processEnv, parsedAll, options);
      if (lastError) {
        return { parsed: parsedAll, error: lastError };
      } else {
        return { parsed: parsedAll };
      }
    }
    function config2(options) {
      if (_dotenvKey(options).length === 0) {
        return DotenvModule.configDotenv(options);
      }
      const vaultPath = _vaultPath(options);
      if (!vaultPath) {
        _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);
        return DotenvModule.configDotenv(options);
      }
      return DotenvModule._configVault(options);
    }
    function decrypt(encrypted, keyStr) {
      const key = Buffer.from(keyStr.slice(-64), "hex");
      let ciphertext = Buffer.from(encrypted, "base64");
      const nonce = ciphertext.subarray(0, 12);
      const authTag = ciphertext.subarray(-16);
      ciphertext = ciphertext.subarray(12, -16);
      try {
        const aesgcm = crypto2.createDecipheriv("aes-256-gcm", key, nonce);
        aesgcm.setAuthTag(authTag);
        return `${aesgcm.update(ciphertext)}${aesgcm.final()}`;
      } catch (error) {
        const isRange = error instanceof RangeError;
        const invalidKeyLength = error.message === "Invalid key length";
        const decryptionFailed = error.message === "Unsupported state or unable to authenticate data";
        if (isRange || invalidKeyLength) {
          const err = new Error("INVALID_DOTENV_KEY: It must be 64 characters long (or more)");
          err.code = "INVALID_DOTENV_KEY";
          throw err;
        } else if (decryptionFailed) {
          const err = new Error("DECRYPTION_FAILED: Please check your DOTENV_KEY");
          err.code = "DECRYPTION_FAILED";
          throw err;
        } else {
          throw error;
        }
      }
    }
    function populate(processEnv, parsed, options = {}) {
      const debug = Boolean(options && options.debug);
      const override = Boolean(options && options.override);
      if (typeof parsed !== "object") {
        const err = new Error("OBJECT_REQUIRED: Please check the processEnv argument being passed to populate");
        err.code = "OBJECT_REQUIRED";
        throw err;
      }
      for (const key of Object.keys(parsed)) {
        if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
          if (override === true) {
            processEnv[key] = parsed[key];
          }
          if (debug) {
            if (override === true) {
              _debug(`"${key}" is already defined and WAS overwritten`);
            } else {
              _debug(`"${key}" is already defined and was NOT overwritten`);
            }
          }
        } else {
          processEnv[key] = parsed[key];
        }
      }
    }
    var DotenvModule = {
      configDotenv,
      _configVault,
      _parseVault,
      config: config2,
      decrypt,
      parse,
      populate
    };
    module2.exports.configDotenv = DotenvModule.configDotenv;
    module2.exports._configVault = DotenvModule._configVault;
    module2.exports._parseVault = DotenvModule._parseVault;
    module2.exports.config = DotenvModule.config;
    module2.exports.decrypt = DotenvModule.decrypt;
    module2.exports.parse = DotenvModule.parse;
    module2.exports.populate = DotenvModule.populate;
    module2.exports = DotenvModule;
  }
});

// server/db.ts
var dotenv = __toESM(require_main());
var import_path = __toESM(require("path"));

// node_modules/drizzle-orm/mysql2/driver.js
var import_mysql2 = require("mysql2");

// node_modules/drizzle-orm/entity.js
var entityKind = Symbol.for("drizzle:entityKind");
var hasOwnEntityKind = Symbol.for("drizzle:hasOwnEntityKind");
function is(value, type) {
  if (!value || typeof value !== "object") {
    return false;
  }
  if (value instanceof type) {
    return true;
  }
  if (!Object.prototype.hasOwnProperty.call(type, entityKind)) {
    throw new Error(
      `Class "${type.name ?? "<unknown>"}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`
    );
  }
  let cls = Object.getPrototypeOf(value).constructor;
  if (cls) {
    while (cls) {
      if (entityKind in cls && cls[entityKind] === type[entityKind]) {
        return true;
      }
      cls = Object.getPrototypeOf(cls);
    }
  }
  return false;
}

// node_modules/drizzle-orm/logger.js
var ConsoleLogWriter = class {
  static [entityKind] = "ConsoleLogWriter";
  write(message) {
    console.log(message);
  }
};
var DefaultLogger = class {
  static [entityKind] = "DefaultLogger";
  writer;
  constructor(config2) {
    this.writer = config2?.writer ?? new ConsoleLogWriter();
  }
  logQuery(query, params) {
    const stringifiedParams = params.map((p) => {
      try {
        return JSON.stringify(p);
      } catch {
        return String(p);
      }
    });
    const paramsStr = stringifiedParams.length ? ` -- params: [${stringifiedParams.join(", ")}]` : "";
    this.writer.write(`Query: ${query}${paramsStr}`);
  }
};
var NoopLogger = class {
  static [entityKind] = "NoopLogger";
  logQuery() {
  }
};

// node_modules/drizzle-orm/column.js
var Column = class {
  constructor(table, config2) {
    this.table = table;
    this.config = config2;
    this.name = config2.name;
    this.keyAsName = config2.keyAsName;
    this.notNull = config2.notNull;
    this.default = config2.default;
    this.defaultFn = config2.defaultFn;
    this.onUpdateFn = config2.onUpdateFn;
    this.hasDefault = config2.hasDefault;
    this.primary = config2.primaryKey;
    this.isUnique = config2.isUnique;
    this.uniqueName = config2.uniqueName;
    this.uniqueType = config2.uniqueType;
    this.dataType = config2.dataType;
    this.columnType = config2.columnType;
    this.generated = config2.generated;
    this.generatedIdentity = config2.generatedIdentity;
  }
  static [entityKind] = "Column";
  name;
  keyAsName;
  primary;
  notNull;
  default;
  defaultFn;
  onUpdateFn;
  hasDefault;
  isUnique;
  uniqueName;
  uniqueType;
  dataType;
  columnType;
  enumValues = void 0;
  generated = void 0;
  generatedIdentity = void 0;
  config;
  mapFromDriverValue(value) {
    return value;
  }
  mapToDriverValue(value) {
    return value;
  }
  // ** @internal */
  shouldDisableInsert() {
    return this.config.generated !== void 0 && this.config.generated.type !== "byDefault";
  }
};

// node_modules/drizzle-orm/column-builder.js
var ColumnBuilder = class {
  static [entityKind] = "ColumnBuilder";
  config;
  constructor(name, dataType, columnType) {
    this.config = {
      name,
      keyAsName: name === "",
      notNull: false,
      default: void 0,
      hasDefault: false,
      primaryKey: false,
      isUnique: false,
      uniqueName: void 0,
      uniqueType: void 0,
      dataType,
      columnType,
      generated: void 0
    };
  }
  /**
   * Changes the data type of the column. Commonly used with `json` columns. Also, useful for branded types.
   *
   * @example
   * ```ts
   * const users = pgTable('users', {
   * 	id: integer('id').$type<UserId>().primaryKey(),
   * 	details: json('details').$type<UserDetails>().notNull(),
   * });
   * ```
   */
  $type() {
    return this;
  }
  /**
   * Adds a `not null` clause to the column definition.
   *
   * Affects the `select` model of the table - columns *without* `not null` will be nullable on select.
   */
  notNull() {
    this.config.notNull = true;
    return this;
  }
  /**
   * Adds a `default <value>` clause to the column definition.
   *
   * Affects the `insert` model of the table - columns *with* `default` are optional on insert.
   *
   * If you need to set a dynamic default value, use {@link $defaultFn} instead.
   */
  default(value) {
    this.config.default = value;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Adds a dynamic default value to the column.
   * The function will be called when the row is inserted, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $defaultFn(fn) {
    this.config.defaultFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Alias for {@link $defaultFn}.
   */
  $default = this.$defaultFn;
  /**
   * Adds a dynamic update value to the column.
   * The function will be called when the row is updated, and the returned value will be used as the column value if none is provided.
   * If no `default` (or `$defaultFn`) value is provided, the function will be called when the row is inserted as well, and the returned value will be used as the column value.
   *
   * **Note:** This value does not affect the `drizzle-kit` behavior, it is only used at runtime in `drizzle-orm`.
   */
  $onUpdateFn(fn) {
    this.config.onUpdateFn = fn;
    this.config.hasDefault = true;
    return this;
  }
  /**
   * Alias for {@link $onUpdateFn}.
   */
  $onUpdate = this.$onUpdateFn;
  /**
   * Adds a `primary key` clause to the column definition. This implicitly makes the column `not null`.
   *
   * In SQLite, `integer primary key` implicitly makes the column auto-incrementing.
   */
  primaryKey() {
    this.config.primaryKey = true;
    this.config.notNull = true;
    return this;
  }
  /** @internal Sets the name of the column to the key within the table definition if a name was not given. */
  setName(name) {
    if (this.config.name !== "")
      return;
    this.config.name = name;
  }
};

// node_modules/drizzle-orm/table.utils.js
var TableName = Symbol.for("drizzle:Name");

// node_modules/drizzle-orm/pg-core/foreign-keys.js
var ForeignKeyBuilder = class {
  static [entityKind] = "PgForeignKeyBuilder";
  /** @internal */
  reference;
  /** @internal */
  _onUpdate = "no action";
  /** @internal */
  _onDelete = "no action";
  constructor(config2, actions) {
    this.reference = () => {
      const { name, columns, foreignColumns } = config2();
      return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
    };
    if (actions) {
      this._onUpdate = actions.onUpdate;
      this._onDelete = actions.onDelete;
    }
  }
  onUpdate(action) {
    this._onUpdate = action === void 0 ? "no action" : action;
    return this;
  }
  onDelete(action) {
    this._onDelete = action === void 0 ? "no action" : action;
    return this;
  }
  /** @internal */
  build(table) {
    return new ForeignKey(table, this);
  }
};
var ForeignKey = class {
  constructor(table, builder) {
    this.table = table;
    this.reference = builder.reference;
    this.onUpdate = builder._onUpdate;
    this.onDelete = builder._onDelete;
  }
  static [entityKind] = "PgForeignKey";
  reference;
  onUpdate;
  onDelete;
  getName() {
    const { name, columns, foreignColumns } = this.reference();
    const columnNames = columns.map((column) => column.name);
    const foreignColumnNames = foreignColumns.map((column) => column.name);
    const chunks = [
      this.table[TableName],
      ...columnNames,
      foreignColumns[0].table[TableName],
      ...foreignColumnNames
    ];
    return name ?? `${chunks.join("_")}_fk`;
  }
};

// node_modules/drizzle-orm/tracing-utils.js
function iife(fn, ...args) {
  return fn(...args);
}

// node_modules/drizzle-orm/pg-core/unique-constraint.js
function uniqueKeyName(table, columns) {
  return `${table[TableName]}_${columns.join("_")}_unique`;
}
var UniqueConstraintBuilder = class {
  constructor(columns, name) {
    this.name = name;
    this.columns = columns;
  }
  static [entityKind] = "PgUniqueConstraintBuilder";
  /** @internal */
  columns;
  /** @internal */
  nullsNotDistinctConfig = false;
  nullsNotDistinct() {
    this.nullsNotDistinctConfig = true;
    return this;
  }
  /** @internal */
  build(table) {
    return new UniqueConstraint(table, this.columns, this.nullsNotDistinctConfig, this.name);
  }
};
var UniqueOnConstraintBuilder = class {
  static [entityKind] = "PgUniqueOnConstraintBuilder";
  /** @internal */
  name;
  constructor(name) {
    this.name = name;
  }
  on(...columns) {
    return new UniqueConstraintBuilder(columns, this.name);
  }
};
var UniqueConstraint = class {
  constructor(table, columns, nullsNotDistinct, name) {
    this.table = table;
    this.columns = columns;
    this.name = name ?? uniqueKeyName(this.table, this.columns.map((column) => column.name));
    this.nullsNotDistinct = nullsNotDistinct;
  }
  static [entityKind] = "PgUniqueConstraint";
  columns;
  name;
  nullsNotDistinct = false;
  getName() {
    return this.name;
  }
};

// node_modules/drizzle-orm/pg-core/utils/array.js
function parsePgArrayValue(arrayString, startFrom, inQuotes) {
  for (let i = startFrom; i < arrayString.length; i++) {
    const char2 = arrayString[i];
    if (char2 === "\\") {
      i++;
      continue;
    }
    if (char2 === '"') {
      return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i + 1];
    }
    if (inQuotes) {
      continue;
    }
    if (char2 === "," || char2 === "}") {
      return [arrayString.slice(startFrom, i).replace(/\\/g, ""), i];
    }
  }
  return [arrayString.slice(startFrom).replace(/\\/g, ""), arrayString.length];
}
function parsePgNestedArray(arrayString, startFrom = 0) {
  const result = [];
  let i = startFrom;
  let lastCharIsComma = false;
  while (i < arrayString.length) {
    const char2 = arrayString[i];
    if (char2 === ",") {
      if (lastCharIsComma || i === startFrom) {
        result.push("");
      }
      lastCharIsComma = true;
      i++;
      continue;
    }
    lastCharIsComma = false;
    if (char2 === "\\") {
      i += 2;
      continue;
    }
    if (char2 === '"') {
      const [value2, startFrom2] = parsePgArrayValue(arrayString, i + 1, true);
      result.push(value2);
      i = startFrom2;
      continue;
    }
    if (char2 === "}") {
      return [result, i + 1];
    }
    if (char2 === "{") {
      const [value2, startFrom2] = parsePgNestedArray(arrayString, i + 1);
      result.push(value2);
      i = startFrom2;
      continue;
    }
    const [value, newStartFrom] = parsePgArrayValue(arrayString, i, false);
    result.push(value);
    i = newStartFrom;
  }
  return [result, i];
}
function parsePgArray(arrayString) {
  const [result] = parsePgNestedArray(arrayString, 1);
  return result;
}
function makePgArray(array) {
  return `{${array.map((item) => {
    if (Array.isArray(item)) {
      return makePgArray(item);
    }
    if (typeof item === "string") {
      return `"${item.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    }
    return `${item}`;
  }).join(",")}}`;
}

// node_modules/drizzle-orm/pg-core/columns/common.js
var PgColumnBuilder = class extends ColumnBuilder {
  foreignKeyConfigs = [];
  static [entityKind] = "PgColumnBuilder";
  array(size) {
    return new PgArrayBuilder(this.config.name, this, size);
  }
  references(ref, actions = {}) {
    this.foreignKeyConfigs.push({ ref, actions });
    return this;
  }
  unique(name, config2) {
    this.config.isUnique = true;
    this.config.uniqueName = name;
    this.config.uniqueType = config2?.nulls;
    return this;
  }
  generatedAlwaysAs(as) {
    this.config.generated = {
      as,
      type: "always",
      mode: "stored"
    };
    return this;
  }
  /** @internal */
  buildForeignKeys(column, table) {
    return this.foreignKeyConfigs.map(({ ref, actions }) => {
      return iife(
        (ref2, actions2) => {
          const builder = new ForeignKeyBuilder(() => {
            const foreignColumn = ref2();
            return { columns: [column], foreignColumns: [foreignColumn] };
          });
          if (actions2.onUpdate) {
            builder.onUpdate(actions2.onUpdate);
          }
          if (actions2.onDelete) {
            builder.onDelete(actions2.onDelete);
          }
          return builder.build(table);
        },
        ref,
        actions
      );
    });
  }
  /** @internal */
  buildExtraConfigColumn(table) {
    return new ExtraConfigColumn(table, this.config);
  }
};
var PgColumn = class extends Column {
  constructor(table, config2) {
    if (!config2.uniqueName) {
      config2.uniqueName = uniqueKeyName(table, [config2.name]);
    }
    super(table, config2);
    this.table = table;
  }
  static [entityKind] = "PgColumn";
};
var ExtraConfigColumn = class extends PgColumn {
  static [entityKind] = "ExtraConfigColumn";
  getSQLType() {
    return this.getSQLType();
  }
  indexConfig = {
    order: this.config.order ?? "asc",
    nulls: this.config.nulls ?? "last",
    opClass: this.config.opClass
  };
  defaultConfig = {
    order: "asc",
    nulls: "last",
    opClass: void 0
  };
  asc() {
    this.indexConfig.order = "asc";
    return this;
  }
  desc() {
    this.indexConfig.order = "desc";
    return this;
  }
  nullsFirst() {
    this.indexConfig.nulls = "first";
    return this;
  }
  nullsLast() {
    this.indexConfig.nulls = "last";
    return this;
  }
  /**
   * ### PostgreSQL documentation quote
   *
   * > An operator class with optional parameters can be specified for each column of an index.
   * The operator class identifies the operators to be used by the index for that column.
   * For example, a B-tree index on four-byte integers would use the int4_ops class;
   * this operator class includes comparison functions for four-byte integers.
   * In practice the default operator class for the column's data type is usually sufficient.
   * The main point of having operator classes is that for some data types, there could be more than one meaningful ordering.
   * For example, we might want to sort a complex-number data type either by absolute value or by real part.
   * We could do this by defining two operator classes for the data type and then selecting the proper class when creating an index.
   * More information about operator classes check:
   *
   * ### Useful links
   * https://www.postgresql.org/docs/current/sql-createindex.html
   *
   * https://www.postgresql.org/docs/current/indexes-opclass.html
   *
   * https://www.postgresql.org/docs/current/xindex.html
   *
   * ### Additional types
   * If you have the `pg_vector` extension installed in your database, you can use the
   * `vector_l2_ops`, `vector_ip_ops`, `vector_cosine_ops`, `vector_l1_ops`, `bit_hamming_ops`, `bit_jaccard_ops`, `halfvec_l2_ops`, `sparsevec_l2_ops` options, which are predefined types.
   *
   * **You can always specify any string you want in the operator class, in case Drizzle doesn't have it natively in its types**
   *
   * @param opClass
   * @returns
   */
  op(opClass) {
    this.indexConfig.opClass = opClass;
    return this;
  }
};
var IndexedColumn = class {
  static [entityKind] = "IndexedColumn";
  constructor(name, keyAsName, type, indexConfig) {
    this.name = name;
    this.keyAsName = keyAsName;
    this.type = type;
    this.indexConfig = indexConfig;
  }
  name;
  keyAsName;
  type;
  indexConfig;
};
var PgArrayBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgArrayBuilder";
  constructor(name, baseBuilder, size) {
    super(name, "array", "PgArray");
    this.config.baseBuilder = baseBuilder;
    this.config.size = size;
  }
  /** @internal */
  build(table) {
    const baseColumn = this.config.baseBuilder.build(table);
    return new PgArray(
      table,
      this.config,
      baseColumn
    );
  }
};
var PgArray = class _PgArray extends PgColumn {
  constructor(table, config2, baseColumn, range) {
    super(table, config2);
    this.baseColumn = baseColumn;
    this.range = range;
    this.size = config2.size;
  }
  size;
  static [entityKind] = "PgArray";
  getSQLType() {
    return `${this.baseColumn.getSQLType()}[${typeof this.size === "number" ? this.size : ""}]`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      value = parsePgArray(value);
    }
    return value.map((v) => this.baseColumn.mapFromDriverValue(v));
  }
  mapToDriverValue(value, isNestedArray = false) {
    const a = value.map(
      (v) => v === null ? null : is(this.baseColumn, _PgArray) ? this.baseColumn.mapToDriverValue(v, true) : this.baseColumn.mapToDriverValue(v)
    );
    if (isNestedArray)
      return a;
    return makePgArray(a);
  }
};

// node_modules/drizzle-orm/pg-core/columns/enum.js
var isPgEnumSym = Symbol.for("drizzle:isPgEnum");
function isPgEnum(obj) {
  return !!obj && typeof obj === "function" && isPgEnumSym in obj && obj[isPgEnumSym] === true;
}
var PgEnumColumnBuilder = class extends PgColumnBuilder {
  static [entityKind] = "PgEnumColumnBuilder";
  constructor(name, enumInstance) {
    super(name, "string", "PgEnumColumn");
    this.config.enum = enumInstance;
  }
  /** @internal */
  build(table) {
    return new PgEnumColumn(
      table,
      this.config
    );
  }
};
var PgEnumColumn = class extends PgColumn {
  static [entityKind] = "PgEnumColumn";
  enum = this.config.enum;
  enumValues = this.config.enum.enumValues;
  constructor(table, config2) {
    super(table, config2);
    this.enum = config2.enum;
  }
  getSQLType() {
    return this.enum.enumName;
  }
};

// node_modules/drizzle-orm/subquery.js
var Subquery = class {
  static [entityKind] = "Subquery";
  constructor(sql2, selection, alias, isWith = false) {
    this._ = {
      brand: "Subquery",
      sql: sql2,
      selectedFields: selection,
      alias,
      isWith
    };
  }
  // getSQL(): SQL<unknown> {
  // 	return new SQL([this]);
  // }
};
var WithSubquery = class extends Subquery {
  static [entityKind] = "WithSubquery";
};

// node_modules/drizzle-orm/version.js
var version = "0.39.3";

// node_modules/drizzle-orm/tracing.js
var otel;
var rawTracer;
var tracer = {
  startActiveSpan(name, fn) {
    if (!otel) {
      return fn();
    }
    if (!rawTracer) {
      rawTracer = otel.trace.getTracer("drizzle-orm", version);
    }
    return iife(
      (otel2, rawTracer2) => rawTracer2.startActiveSpan(
        name,
        (span) => {
          try {
            return fn(span);
          } catch (e) {
            span.setStatus({
              code: otel2.SpanStatusCode.ERROR,
              message: e instanceof Error ? e.message : "Unknown error"
              // eslint-disable-line no-instanceof/no-instanceof
            });
            throw e;
          } finally {
            span.end();
          }
        }
      ),
      otel,
      rawTracer
    );
  }
};

// node_modules/drizzle-orm/view-common.js
var ViewBaseConfig = Symbol.for("drizzle:ViewBaseConfig");

// node_modules/drizzle-orm/table.js
var Schema = Symbol.for("drizzle:Schema");
var Columns = Symbol.for("drizzle:Columns");
var ExtraConfigColumns = Symbol.for("drizzle:ExtraConfigColumns");
var OriginalName = Symbol.for("drizzle:OriginalName");
var BaseName = Symbol.for("drizzle:BaseName");
var IsAlias = Symbol.for("drizzle:IsAlias");
var ExtraConfigBuilder = Symbol.for("drizzle:ExtraConfigBuilder");
var IsDrizzleTable = Symbol.for("drizzle:IsDrizzleTable");
var Table = class {
  static [entityKind] = "Table";
  /** @internal */
  static Symbol = {
    Name: TableName,
    Schema,
    OriginalName,
    Columns,
    ExtraConfigColumns,
    BaseName,
    IsAlias,
    ExtraConfigBuilder
  };
  /**
   * @internal
   * Can be changed if the table is aliased.
   */
  [TableName];
  /**
   * @internal
   * Used to store the original name of the table, before any aliasing.
   */
  [OriginalName];
  /** @internal */
  [Schema];
  /** @internal */
  [Columns];
  /** @internal */
  [ExtraConfigColumns];
  /**
   *  @internal
   * Used to store the table name before the transformation via the `tableCreator` functions.
   */
  [BaseName];
  /** @internal */
  [IsAlias] = false;
  /** @internal */
  [IsDrizzleTable] = true;
  /** @internal */
  [ExtraConfigBuilder] = void 0;
  constructor(name, schema, baseName) {
    this[TableName] = this[OriginalName] = name;
    this[Schema] = schema;
    this[BaseName] = baseName;
  }
};
function isTable(table) {
  return typeof table === "object" && table !== null && IsDrizzleTable in table;
}
function getTableName(table) {
  return table[TableName];
}
function getTableUniqueName(table) {
  return `${table[Schema] ?? "public"}.${table[TableName]}`;
}

// node_modules/drizzle-orm/sql/sql.js
var FakePrimitiveParam = class {
  static [entityKind] = "FakePrimitiveParam";
};
function isSQLWrapper(value) {
  return value !== null && value !== void 0 && typeof value.getSQL === "function";
}
function mergeQueries(queries) {
  const result = { sql: "", params: [] };
  for (const query of queries) {
    result.sql += query.sql;
    result.params.push(...query.params);
    if (query.typings?.length) {
      if (!result.typings) {
        result.typings = [];
      }
      result.typings.push(...query.typings);
    }
  }
  return result;
}
var StringChunk = class {
  static [entityKind] = "StringChunk";
  value;
  constructor(value) {
    this.value = Array.isArray(value) ? value : [value];
  }
  getSQL() {
    return new SQL([this]);
  }
};
var SQL = class _SQL {
  constructor(queryChunks) {
    this.queryChunks = queryChunks;
  }
  static [entityKind] = "SQL";
  /** @internal */
  decoder = noopDecoder;
  shouldInlineParams = false;
  append(query) {
    this.queryChunks.push(...query.queryChunks);
    return this;
  }
  toQuery(config2) {
    return tracer.startActiveSpan("drizzle.buildSQL", (span) => {
      const query = this.buildQueryFromSourceParams(this.queryChunks, config2);
      span?.setAttributes({
        "drizzle.query.text": query.sql,
        "drizzle.query.params": JSON.stringify(query.params)
      });
      return query;
    });
  }
  buildQueryFromSourceParams(chunks, _config) {
    const config2 = Object.assign({}, _config, {
      inlineParams: _config.inlineParams || this.shouldInlineParams,
      paramStartIndex: _config.paramStartIndex || { value: 0 }
    });
    const {
      casing,
      escapeName,
      escapeParam,
      prepareTyping,
      inlineParams,
      paramStartIndex
    } = config2;
    return mergeQueries(chunks.map((chunk) => {
      if (is(chunk, StringChunk)) {
        return { sql: chunk.value.join(""), params: [] };
      }
      if (is(chunk, Name)) {
        return { sql: escapeName(chunk.value), params: [] };
      }
      if (chunk === void 0) {
        return { sql: "", params: [] };
      }
      if (Array.isArray(chunk)) {
        const result = [new StringChunk("(")];
        for (const [i, p] of chunk.entries()) {
          result.push(p);
          if (i < chunk.length - 1) {
            result.push(new StringChunk(", "));
          }
        }
        result.push(new StringChunk(")"));
        return this.buildQueryFromSourceParams(result, config2);
      }
      if (is(chunk, _SQL)) {
        return this.buildQueryFromSourceParams(chunk.queryChunks, {
          ...config2,
          inlineParams: inlineParams || chunk.shouldInlineParams
        });
      }
      if (is(chunk, Table)) {
        const schemaName = chunk[Table.Symbol.Schema];
        const tableName = chunk[Table.Symbol.Name];
        return {
          sql: schemaName === void 0 || chunk[IsAlias] ? escapeName(tableName) : escapeName(schemaName) + "." + escapeName(tableName),
          params: []
        };
      }
      if (is(chunk, Column)) {
        const columnName = casing.getColumnCasing(chunk);
        if (_config.invokeSource === "indexes") {
          return { sql: escapeName(columnName), params: [] };
        }
        const schemaName = chunk.table[Table.Symbol.Schema];
        return {
          sql: chunk.table[IsAlias] || schemaName === void 0 ? escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName) : escapeName(schemaName) + "." + escapeName(chunk.table[Table.Symbol.Name]) + "." + escapeName(columnName),
          params: []
        };
      }
      if (is(chunk, View)) {
        const schemaName = chunk[ViewBaseConfig].schema;
        const viewName = chunk[ViewBaseConfig].name;
        return {
          sql: schemaName === void 0 || chunk[ViewBaseConfig].isAlias ? escapeName(viewName) : escapeName(schemaName) + "." + escapeName(viewName),
          params: []
        };
      }
      if (is(chunk, Param)) {
        if (is(chunk.value, Placeholder)) {
          return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
        }
        const mappedValue = chunk.value === null ? null : chunk.encoder.mapToDriverValue(chunk.value);
        if (is(mappedValue, _SQL)) {
          return this.buildQueryFromSourceParams([mappedValue], config2);
        }
        if (inlineParams) {
          return { sql: this.mapInlineParam(mappedValue, config2), params: [] };
        }
        let typings = ["none"];
        if (prepareTyping) {
          typings = [prepareTyping(chunk.encoder)];
        }
        return { sql: escapeParam(paramStartIndex.value++, mappedValue), params: [mappedValue], typings };
      }
      if (is(chunk, Placeholder)) {
        return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
      }
      if (is(chunk, _SQL.Aliased) && chunk.fieldAlias !== void 0) {
        return { sql: escapeName(chunk.fieldAlias), params: [] };
      }
      if (is(chunk, Subquery)) {
        if (chunk._.isWith) {
          return { sql: escapeName(chunk._.alias), params: [] };
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk._.sql,
          new StringChunk(") "),
          new Name(chunk._.alias)
        ], config2);
      }
      if (isPgEnum(chunk)) {
        if (chunk.schema) {
          return { sql: escapeName(chunk.schema) + "." + escapeName(chunk.enumName), params: [] };
        }
        return { sql: escapeName(chunk.enumName), params: [] };
      }
      if (isSQLWrapper(chunk)) {
        if (chunk.shouldOmitSQLParens?.()) {
          return this.buildQueryFromSourceParams([chunk.getSQL()], config2);
        }
        return this.buildQueryFromSourceParams([
          new StringChunk("("),
          chunk.getSQL(),
          new StringChunk(")")
        ], config2);
      }
      if (inlineParams) {
        return { sql: this.mapInlineParam(chunk, config2), params: [] };
      }
      return { sql: escapeParam(paramStartIndex.value++, chunk), params: [chunk], typings: ["none"] };
    }));
  }
  mapInlineParam(chunk, { escapeString }) {
    if (chunk === null) {
      return "null";
    }
    if (typeof chunk === "number" || typeof chunk === "boolean") {
      return chunk.toString();
    }
    if (typeof chunk === "string") {
      return escapeString(chunk);
    }
    if (typeof chunk === "object") {
      const mappedValueAsString = chunk.toString();
      if (mappedValueAsString === "[object Object]") {
        return escapeString(JSON.stringify(chunk));
      }
      return escapeString(mappedValueAsString);
    }
    throw new Error("Unexpected param value: " + chunk);
  }
  getSQL() {
    return this;
  }
  as(alias) {
    if (alias === void 0) {
      return this;
    }
    return new _SQL.Aliased(this, alias);
  }
  mapWith(decoder) {
    this.decoder = typeof decoder === "function" ? { mapFromDriverValue: decoder } : decoder;
    return this;
  }
  inlineParams() {
    this.shouldInlineParams = true;
    return this;
  }
  /**
   * This method is used to conditionally include a part of the query.
   *
   * @param condition - Condition to check
   * @returns itself if the condition is `true`, otherwise `undefined`
   */
  if(condition) {
    return condition ? this : void 0;
  }
};
var Name = class {
  constructor(value) {
    this.value = value;
  }
  static [entityKind] = "Name";
  brand;
  getSQL() {
    return new SQL([this]);
  }
};
function isDriverValueEncoder(value) {
  return typeof value === "object" && value !== null && "mapToDriverValue" in value && typeof value.mapToDriverValue === "function";
}
var noopDecoder = {
  mapFromDriverValue: (value) => value
};
var noopEncoder = {
  mapToDriverValue: (value) => value
};
var noopMapper = {
  ...noopDecoder,
  ...noopEncoder
};
var Param = class {
  /**
   * @param value - Parameter value
   * @param encoder - Encoder to convert the value to a driver parameter
   */
  constructor(value, encoder = noopEncoder) {
    this.value = value;
    this.encoder = encoder;
  }
  static [entityKind] = "Param";
  brand;
  getSQL() {
    return new SQL([this]);
  }
};
function sql(strings, ...params) {
  const queryChunks = [];
  if (params.length > 0 || strings.length > 0 && strings[0] !== "") {
    queryChunks.push(new StringChunk(strings[0]));
  }
  for (const [paramIndex, param2] of params.entries()) {
    queryChunks.push(param2, new StringChunk(strings[paramIndex + 1]));
  }
  return new SQL(queryChunks);
}
((sql2) => {
  function empty() {
    return new SQL([]);
  }
  sql2.empty = empty;
  function fromList(list) {
    return new SQL(list);
  }
  sql2.fromList = fromList;
  function raw(str) {
    return new SQL([new StringChunk(str)]);
  }
  sql2.raw = raw;
  function join(chunks, separator) {
    const result = [];
    for (const [i, chunk] of chunks.entries()) {
      if (i > 0 && separator !== void 0) {
        result.push(separator);
      }
      result.push(chunk);
    }
    return new SQL(result);
  }
  sql2.join = join;
  function identifier(value) {
    return new Name(value);
  }
  sql2.identifier = identifier;
  function placeholder2(name2) {
    return new Placeholder(name2);
  }
  sql2.placeholder = placeholder2;
  function param2(value, encoder) {
    return new Param(value, encoder);
  }
  sql2.param = param2;
})(sql || (sql = {}));
((SQL2) => {
  class Aliased {
    constructor(sql2, fieldAlias) {
      this.sql = sql2;
      this.fieldAlias = fieldAlias;
    }
    static [entityKind] = "SQL.Aliased";
    /** @internal */
    isSelectionField = false;
    getSQL() {
      return this.sql;
    }
    /** @internal */
    clone() {
      return new Aliased(this.sql, this.fieldAlias);
    }
  }
  SQL2.Aliased = Aliased;
})(SQL || (SQL = {}));
var Placeholder = class {
  constructor(name2) {
    this.name = name2;
  }
  static [entityKind] = "Placeholder";
  getSQL() {
    return new SQL([this]);
  }
};
function fillPlaceholders(params, values) {
  return params.map((p) => {
    if (is(p, Placeholder)) {
      if (!(p.name in values)) {
        throw new Error(`No value for placeholder "${p.name}" was provided`);
      }
      return values[p.name];
    }
    if (is(p, Param) && is(p.value, Placeholder)) {
      if (!(p.value.name in values)) {
        throw new Error(`No value for placeholder "${p.value.name}" was provided`);
      }
      return p.encoder.mapToDriverValue(values[p.value.name]);
    }
    return p;
  });
}
var IsDrizzleView = Symbol.for("drizzle:IsDrizzleView");
var View = class {
  static [entityKind] = "View";
  /** @internal */
  [ViewBaseConfig];
  /** @internal */
  [IsDrizzleView] = true;
  constructor({ name: name2, schema, selectedFields, query }) {
    this[ViewBaseConfig] = {
      name: name2,
      originalName: name2,
      schema,
      selectedFields,
      query,
      isExisting: !query,
      isAlias: false
    };
  }
  getSQL() {
    return new SQL([this]);
  }
};
function isView(view) {
  return typeof view === "object" && view !== null && IsDrizzleView in view;
}
Column.prototype.getSQL = function() {
  return new SQL([this]);
};
Table.prototype.getSQL = function() {
  return new SQL([this]);
};
Subquery.prototype.getSQL = function() {
  return new SQL([this]);
};

// node_modules/drizzle-orm/alias.js
var ColumnAliasProxyHandler = class {
  constructor(table) {
    this.table = table;
  }
  static [entityKind] = "ColumnAliasProxyHandler";
  get(columnObj, prop) {
    if (prop === "table") {
      return this.table;
    }
    return columnObj[prop];
  }
};
var TableAliasProxyHandler = class {
  constructor(alias, replaceOriginalName) {
    this.alias = alias;
    this.replaceOriginalName = replaceOriginalName;
  }
  static [entityKind] = "TableAliasProxyHandler";
  get(target, prop) {
    if (prop === Table.Symbol.IsAlias) {
      return true;
    }
    if (prop === Table.Symbol.Name) {
      return this.alias;
    }
    if (this.replaceOriginalName && prop === Table.Symbol.OriginalName) {
      return this.alias;
    }
    if (prop === ViewBaseConfig) {
      return {
        ...target[ViewBaseConfig],
        name: this.alias,
        isAlias: true
      };
    }
    if (prop === Table.Symbol.Columns) {
      const columns = target[Table.Symbol.Columns];
      if (!columns) {
        return columns;
      }
      const proxiedColumns = {};
      Object.keys(columns).map((key) => {
        proxiedColumns[key] = new Proxy(
          columns[key],
          new ColumnAliasProxyHandler(new Proxy(target, this))
        );
      });
      return proxiedColumns;
    }
    const value = target[prop];
    if (is(value, Column)) {
      return new Proxy(value, new ColumnAliasProxyHandler(new Proxy(target, this)));
    }
    return value;
  }
};
var RelationTableAliasProxyHandler = class {
  constructor(alias) {
    this.alias = alias;
  }
  static [entityKind] = "RelationTableAliasProxyHandler";
  get(target, prop) {
    if (prop === "sourceTable") {
      return aliasedTable(target.sourceTable, this.alias);
    }
    return target[prop];
  }
};
function aliasedTable(table, tableAlias) {
  return new Proxy(table, new TableAliasProxyHandler(tableAlias, false));
}
function aliasedTableColumn(column, tableAlias) {
  return new Proxy(
    column,
    new ColumnAliasProxyHandler(new Proxy(column.table, new TableAliasProxyHandler(tableAlias, false)))
  );
}
function mapColumnsInAliasedSQLToAlias(query, alias) {
  return new SQL.Aliased(mapColumnsInSQLToAlias(query.sql, alias), query.fieldAlias);
}
function mapColumnsInSQLToAlias(query, alias) {
  return sql.join(query.queryChunks.map((c) => {
    if (is(c, Column)) {
      return aliasedTableColumn(c, alias);
    }
    if (is(c, SQL)) {
      return mapColumnsInSQLToAlias(c, alias);
    }
    if (is(c, SQL.Aliased)) {
      return mapColumnsInAliasedSQLToAlias(c, alias);
    }
    return c;
  }));
}

// node_modules/drizzle-orm/selection-proxy.js
var SelectionProxyHandler = class _SelectionProxyHandler {
  static [entityKind] = "SelectionProxyHandler";
  config;
  constructor(config2) {
    this.config = { ...config2 };
  }
  get(subquery, prop) {
    if (prop === "_") {
      return {
        ...subquery["_"],
        selectedFields: new Proxy(
          subquery._.selectedFields,
          this
        )
      };
    }
    if (prop === ViewBaseConfig) {
      return {
        ...subquery[ViewBaseConfig],
        selectedFields: new Proxy(
          subquery[ViewBaseConfig].selectedFields,
          this
        )
      };
    }
    if (typeof prop === "symbol") {
      return subquery[prop];
    }
    const columns = is(subquery, Subquery) ? subquery._.selectedFields : is(subquery, View) ? subquery[ViewBaseConfig].selectedFields : subquery;
    const value = columns[prop];
    if (is(value, SQL.Aliased)) {
      if (this.config.sqlAliasedBehavior === "sql" && !value.isSelectionField) {
        return value.sql;
      }
      const newValue = value.clone();
      newValue.isSelectionField = true;
      return newValue;
    }
    if (is(value, SQL)) {
      if (this.config.sqlBehavior === "sql") {
        return value;
      }
      throw new Error(
        `You tried to reference "${prop}" field from a subquery, which is a raw SQL field, but it doesn't have an alias declared. Please add an alias to the field using ".as('alias')" method.`
      );
    }
    if (is(value, Column)) {
      if (this.config.alias) {
        return new Proxy(
          value,
          new ColumnAliasProxyHandler(
            new Proxy(
              value.table,
              new TableAliasProxyHandler(this.config.alias, this.config.replaceOriginalName ?? false)
            )
          )
        );
      }
      return value;
    }
    if (typeof value !== "object" || value === null) {
      return value;
    }
    return new Proxy(value, new _SelectionProxyHandler(this.config));
  }
};

// node_modules/drizzle-orm/mysql-core/query-builders/count.js
var MySqlCountBuilder = class _MySqlCountBuilder extends SQL {
  constructor(params) {
    super(_MySqlCountBuilder.buildEmbeddedCount(params.source, params.filters).queryChunks);
    this.params = params;
    this.mapWith(Number);
    this.session = params.session;
    this.sql = _MySqlCountBuilder.buildCount(
      params.source,
      params.filters
    );
  }
  sql;
  static [entityKind] = "MySqlCountBuilder";
  [Symbol.toStringTag] = "MySqlCountBuilder";
  session;
  static buildEmbeddedCount(source, filters) {
    return sql`(select count(*) from ${source}${sql.raw(" where ").if(filters)}${filters})`;
  }
  static buildCount(source, filters) {
    return sql`select count(*) as count from ${source}${sql.raw(" where ").if(filters)}${filters}`;
  }
  then(onfulfilled, onrejected) {
    return Promise.resolve(this.session.count(this.sql)).then(
      onfulfilled,
      onrejected
    );
  }
  catch(onRejected) {
    return this.then(void 0, onRejected);
  }
  finally(onFinally) {
    return this.then(
      (value) => {
        onFinally?.();
        return value;
      },
      (reason) => {
        onFinally?.();
        throw reason;
      }
    );
  }
};

// node_modules/drizzle-orm/query-promise.js
var QueryPromise = class {
  static [entityKind] = "QueryPromise";
  [Symbol.toStringTag] = "QueryPromise";
  catch(onRejected) {
    return this.then(void 0, onRejected);
  }
  finally(onFinally) {
    return this.then(
      (value) => {
        onFinally?.();
        return value;
      },
      (reason) => {
        onFinally?.();
        throw reason;
      }
    );
  }
  then(onFulfilled, onRejected) {
    return this.execute().then(onFulfilled, onRejected);
  }
};

// node_modules/drizzle-orm/mysql-core/query-builders/delete.js
var MySqlDeleteBase = class extends QueryPromise {
  constructor(table, session, dialect, withList) {
    super();
    this.table = table;
    this.session = session;
    this.dialect = dialect;
    this.config = { table, withList };
  }
  static [entityKind] = "MySqlDelete";
  config;
  /**
   * Adds a `where` clause to the query.
   *
   * Calling this method will delete only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/delete}
   *
   * @param where the `where` clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be deleted.
   *
   * ```ts
   * // Delete all cars with green color
   * db.delete(cars).where(eq(cars.color, 'green'));
   * // or
   * db.delete(cars).where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Delete all BMW cars with a green color
   * db.delete(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Delete all cars with the green or blue color
   * db.delete(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    this.config.where = where;
    return this;
  }
  orderBy(...columns) {
    if (typeof columns[0] === "function") {
      const orderBy = columns[0](
        new Proxy(
          this.config.table[Table.Symbol.Columns],
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
      this.config.orderBy = orderByArray;
    } else {
      const orderByArray = columns;
      this.config.orderBy = orderByArray;
    }
    return this;
  }
  limit(limit) {
    this.config.limit = limit;
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildDeleteQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  prepare() {
    return this.session.prepareQuery(
      this.dialect.sqlToQuery(this.getSQL()),
      this.config.returning
    );
  }
  execute = (placeholderValues) => {
    return this.prepare().execute(placeholderValues);
  };
  createIterator = () => {
    const self = this;
    return async function* (placeholderValues) {
      yield* self.prepare().iterator(placeholderValues);
    };
  };
  iterator = this.createIterator();
  $dynamic() {
    return this;
  }
};

// node_modules/drizzle-orm/utils.js
function mapResultRow(columns, row, joinsNotNullableMap) {
  const nullifyMap = {};
  const result = columns.reduce(
    (result2, { path: path2, field }, columnIndex) => {
      let decoder;
      if (is(field, Column)) {
        decoder = field;
      } else if (is(field, SQL)) {
        decoder = field.decoder;
      } else {
        decoder = field.sql.decoder;
      }
      let node = result2;
      for (const [pathChunkIndex, pathChunk] of path2.entries()) {
        if (pathChunkIndex < path2.length - 1) {
          if (!(pathChunk in node)) {
            node[pathChunk] = {};
          }
          node = node[pathChunk];
        } else {
          const rawValue = row[columnIndex];
          const value = node[pathChunk] = rawValue === null ? null : decoder.mapFromDriverValue(rawValue);
          if (joinsNotNullableMap && is(field, Column) && path2.length === 2) {
            const objectName = path2[0];
            if (!(objectName in nullifyMap)) {
              nullifyMap[objectName] = value === null ? getTableName(field.table) : false;
            } else if (typeof nullifyMap[objectName] === "string" && nullifyMap[objectName] !== getTableName(field.table)) {
              nullifyMap[objectName] = false;
            }
          }
        }
      }
      return result2;
    },
    {}
  );
  if (joinsNotNullableMap && Object.keys(nullifyMap).length > 0) {
    for (const [objectName, tableName] of Object.entries(nullifyMap)) {
      if (typeof tableName === "string" && !joinsNotNullableMap[tableName]) {
        result[objectName] = null;
      }
    }
  }
  return result;
}
function orderSelectedFields(fields, pathPrefix) {
  return Object.entries(fields).reduce((result, [name, field]) => {
    if (typeof name !== "string") {
      return result;
    }
    const newPath = pathPrefix ? [...pathPrefix, name] : [name];
    if (is(field, Column) || is(field, SQL) || is(field, SQL.Aliased)) {
      result.push({ path: newPath, field });
    } else if (is(field, Table)) {
      result.push(...orderSelectedFields(field[Table.Symbol.Columns], newPath));
    } else {
      result.push(...orderSelectedFields(field, newPath));
    }
    return result;
  }, []);
}
function haveSameKeys(left, right) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) {
    return false;
  }
  for (const [index, key] of leftKeys.entries()) {
    if (key !== rightKeys[index]) {
      return false;
    }
  }
  return true;
}
function mapUpdateSet(table, values) {
  const entries = Object.entries(values).filter(([, value]) => value !== void 0).map(([key, value]) => {
    if (is(value, SQL) || is(value, Column)) {
      return [key, value];
    } else {
      return [key, new Param(value, table[Table.Symbol.Columns][key])];
    }
  });
  if (entries.length === 0) {
    throw new Error("No values to set");
  }
  return Object.fromEntries(entries);
}
function applyMixins(baseClass, extendedClasses) {
  for (const extendedClass of extendedClasses) {
    for (const name of Object.getOwnPropertyNames(extendedClass.prototype)) {
      if (name === "constructor")
        continue;
      Object.defineProperty(
        baseClass.prototype,
        name,
        Object.getOwnPropertyDescriptor(extendedClass.prototype, name) || /* @__PURE__ */ Object.create(null)
      );
    }
  }
}
function getTableColumns(table) {
  return table[Table.Symbol.Columns];
}
function getViewSelectedFields(view) {
  return view[ViewBaseConfig].selectedFields;
}
function getTableLikeName(table) {
  return is(table, Subquery) ? table._.alias : is(table, View) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : table[Table.Symbol.IsAlias] ? table[Table.Symbol.Name] : table[Table.Symbol.BaseName];
}
function getColumnNameAndConfig(a, b) {
  return {
    name: typeof a === "string" && a.length > 0 ? a : "",
    config: typeof a === "object" ? a : b
  };
}
function isConfig(data) {
  if (typeof data !== "object" || data === null)
    return false;
  if (data.constructor.name !== "Object")
    return false;
  if ("logger" in data) {
    const type = typeof data["logger"];
    if (type !== "boolean" && (type !== "object" || typeof data["logger"]["logQuery"] !== "function") && type !== "undefined")
      return false;
    return true;
  }
  if ("schema" in data) {
    const type = typeof data["logger"];
    if (type !== "object" && type !== "undefined")
      return false;
    return true;
  }
  if ("casing" in data) {
    const type = typeof data["logger"];
    if (type !== "string" && type !== "undefined")
      return false;
    return true;
  }
  if ("mode" in data) {
    if (data["mode"] !== "default" || data["mode"] !== "planetscale" || data["mode"] !== void 0)
      return false;
    return true;
  }
  if ("connection" in data) {
    const type = typeof data["connection"];
    if (type !== "string" && type !== "object" && type !== "undefined")
      return false;
    return true;
  }
  if ("client" in data) {
    const type = typeof data["client"];
    if (type !== "object" && type !== "function" && type !== "undefined")
      return false;
    return true;
  }
  if (Object.keys(data).length === 0)
    return true;
  return false;
}

// node_modules/drizzle-orm/casing.js
function toSnakeCase(input) {
  const words = input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
  return words.map((word) => word.toLowerCase()).join("_");
}
function toCamelCase(input) {
  const words = input.replace(/['\u2019]/g, "").match(/[\da-z]+|[A-Z]+(?![a-z])|[A-Z][\da-z]+/g) ?? [];
  return words.reduce((acc, word, i) => {
    const formattedWord = i === 0 ? word.toLowerCase() : `${word[0].toUpperCase()}${word.slice(1)}`;
    return acc + formattedWord;
  }, "");
}
function noopCase(input) {
  return input;
}
var CasingCache = class {
  static [entityKind] = "CasingCache";
  /** @internal */
  cache = {};
  cachedTables = {};
  convert;
  constructor(casing) {
    this.convert = casing === "snake_case" ? toSnakeCase : casing === "camelCase" ? toCamelCase : noopCase;
  }
  getColumnCasing(column) {
    if (!column.keyAsName)
      return column.name;
    const schema = column.table[Table.Symbol.Schema] ?? "public";
    const tableName = column.table[Table.Symbol.OriginalName];
    const key = `${schema}.${tableName}.${column.name}`;
    if (!this.cache[key]) {
      this.cacheTable(column.table);
    }
    return this.cache[key];
  }
  cacheTable(table) {
    const schema = table[Table.Symbol.Schema] ?? "public";
    const tableName = table[Table.Symbol.OriginalName];
    const tableKey = `${schema}.${tableName}`;
    if (!this.cachedTables[tableKey]) {
      for (const column of Object.values(table[Table.Symbol.Columns])) {
        const columnKey = `${tableKey}.${column.name}`;
        this.cache[columnKey] = this.convert(column.name);
      }
      this.cachedTables[tableKey] = true;
    }
  }
  clearCache() {
    this.cache = {};
    this.cachedTables = {};
  }
};

// node_modules/drizzle-orm/errors.js
var DrizzleError = class extends Error {
  static [entityKind] = "DrizzleError";
  constructor({ message, cause }) {
    super(message);
    this.name = "DrizzleError";
    this.cause = cause;
  }
};
var TransactionRollbackError = class extends DrizzleError {
  static [entityKind] = "TransactionRollbackError";
  constructor() {
    super({ message: "Rollback" });
  }
};

// node_modules/drizzle-orm/sql/expressions/conditions.js
function bindIfParam(value, column) {
  if (isDriverValueEncoder(column) && !isSQLWrapper(value) && !is(value, Param) && !is(value, Placeholder) && !is(value, Column) && !is(value, Table) && !is(value, View)) {
    return new Param(value, column);
  }
  return value;
}
var eq = (left, right) => {
  return sql`${left} = ${bindIfParam(right, left)}`;
};
var ne = (left, right) => {
  return sql`${left} <> ${bindIfParam(right, left)}`;
};
function and(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter(
    (c) => c !== void 0
  );
  if (conditions.length === 0) {
    return void 0;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" and ")),
    new StringChunk(")")
  ]);
}
function or(...unfilteredConditions) {
  const conditions = unfilteredConditions.filter(
    (c) => c !== void 0
  );
  if (conditions.length === 0) {
    return void 0;
  }
  if (conditions.length === 1) {
    return new SQL(conditions);
  }
  return new SQL([
    new StringChunk("("),
    sql.join(conditions, new StringChunk(" or ")),
    new StringChunk(")")
  ]);
}
function not(condition) {
  return sql`not ${condition}`;
}
var gt = (left, right) => {
  return sql`${left} > ${bindIfParam(right, left)}`;
};
var gte = (left, right) => {
  return sql`${left} >= ${bindIfParam(right, left)}`;
};
var lt = (left, right) => {
  return sql`${left} < ${bindIfParam(right, left)}`;
};
var lte = (left, right) => {
  return sql`${left} <= ${bindIfParam(right, left)}`;
};
function inArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      return sql`false`;
    }
    return sql`${column} in ${values.map((v) => bindIfParam(v, column))}`;
  }
  return sql`${column} in ${bindIfParam(values, column)}`;
}
function notInArray(column, values) {
  if (Array.isArray(values)) {
    if (values.length === 0) {
      return sql`true`;
    }
    return sql`${column} not in ${values.map((v) => bindIfParam(v, column))}`;
  }
  return sql`${column} not in ${bindIfParam(values, column)}`;
}
function isNull(value) {
  return sql`${value} is null`;
}
function isNotNull(value) {
  return sql`${value} is not null`;
}
function exists(subquery) {
  return sql`exists ${subquery}`;
}
function notExists(subquery) {
  return sql`not exists ${subquery}`;
}
function between(column, min, max) {
  return sql`${column} between ${bindIfParam(min, column)} and ${bindIfParam(
    max,
    column
  )}`;
}
function notBetween(column, min, max) {
  return sql`${column} not between ${bindIfParam(
    min,
    column
  )} and ${bindIfParam(max, column)}`;
}
function like(column, value) {
  return sql`${column} like ${value}`;
}
function notLike(column, value) {
  return sql`${column} not like ${value}`;
}
function ilike(column, value) {
  return sql`${column} ilike ${value}`;
}
function notIlike(column, value) {
  return sql`${column} not ilike ${value}`;
}

// node_modules/drizzle-orm/sql/expressions/select.js
function asc(column) {
  return sql`${column} asc`;
}
function desc(column) {
  return sql`${column} desc`;
}

// node_modules/drizzle-orm/pg-core/table.js
var InlineForeignKeys = Symbol.for("drizzle:PgInlineForeignKeys");
var EnableRLS = Symbol.for("drizzle:EnableRLS");
var PgTable = class extends Table {
  static [entityKind] = "PgTable";
  /** @internal */
  static Symbol = Object.assign({}, Table.Symbol, {
    InlineForeignKeys,
    EnableRLS
  });
  /**@internal */
  [InlineForeignKeys] = [];
  /** @internal */
  [EnableRLS] = false;
  /** @internal */
  [Table.Symbol.ExtraConfigBuilder] = void 0;
};

// node_modules/drizzle-orm/pg-core/primary-keys.js
var PrimaryKeyBuilder = class {
  static [entityKind] = "PgPrimaryKeyBuilder";
  /** @internal */
  columns;
  /** @internal */
  name;
  constructor(columns, name) {
    this.columns = columns;
    this.name = name;
  }
  /** @internal */
  build(table) {
    return new PrimaryKey(table, this.columns, this.name);
  }
};
var PrimaryKey = class {
  constructor(table, columns, name) {
    this.table = table;
    this.columns = columns;
    this.name = name;
  }
  static [entityKind] = "PgPrimaryKey";
  columns;
  name;
  getName() {
    return this.name ?? `${this.table[PgTable.Symbol.Name]}_${this.columns.map((column) => column.name).join("_")}_pk`;
  }
};

// node_modules/drizzle-orm/relations.js
var Relation = class {
  constructor(sourceTable, referencedTable, relationName) {
    this.sourceTable = sourceTable;
    this.referencedTable = referencedTable;
    this.relationName = relationName;
    this.referencedTableName = referencedTable[Table.Symbol.Name];
  }
  static [entityKind] = "Relation";
  referencedTableName;
  fieldName;
};
var Relations = class {
  constructor(table, config2) {
    this.table = table;
    this.config = config2;
  }
  static [entityKind] = "Relations";
};
var One = class _One extends Relation {
  constructor(sourceTable, referencedTable, config2, isNullable) {
    super(sourceTable, referencedTable, config2?.relationName);
    this.config = config2;
    this.isNullable = isNullable;
  }
  static [entityKind] = "One";
  withFieldName(fieldName) {
    const relation = new _One(
      this.sourceTable,
      this.referencedTable,
      this.config,
      this.isNullable
    );
    relation.fieldName = fieldName;
    return relation;
  }
};
var Many = class _Many extends Relation {
  constructor(sourceTable, referencedTable, config2) {
    super(sourceTable, referencedTable, config2?.relationName);
    this.config = config2;
  }
  static [entityKind] = "Many";
  withFieldName(fieldName) {
    const relation = new _Many(
      this.sourceTable,
      this.referencedTable,
      this.config
    );
    relation.fieldName = fieldName;
    return relation;
  }
};
function getOperators() {
  return {
    and,
    between,
    eq,
    exists,
    gt,
    gte,
    ilike,
    inArray,
    isNull,
    isNotNull,
    like,
    lt,
    lte,
    ne,
    not,
    notBetween,
    notExists,
    notLike,
    notIlike,
    notInArray,
    or,
    sql
  };
}
function getOrderByOperators() {
  return {
    sql,
    asc,
    desc
  };
}
function extractTablesRelationalConfig(schema, configHelpers) {
  if (Object.keys(schema).length === 1 && "default" in schema && !is(schema["default"], Table)) {
    schema = schema["default"];
  }
  const tableNamesMap = {};
  const relationsBuffer = {};
  const tablesConfig = {};
  for (const [key, value] of Object.entries(schema)) {
    if (is(value, Table)) {
      const dbName = getTableUniqueName(value);
      const bufferedRelations = relationsBuffer[dbName];
      tableNamesMap[dbName] = key;
      tablesConfig[key] = {
        tsName: key,
        dbName: value[Table.Symbol.Name],
        schema: value[Table.Symbol.Schema],
        columns: value[Table.Symbol.Columns],
        relations: bufferedRelations?.relations ?? {},
        primaryKey: bufferedRelations?.primaryKey ?? []
      };
      for (const column of Object.values(
        value[Table.Symbol.Columns]
      )) {
        if (column.primary) {
          tablesConfig[key].primaryKey.push(column);
        }
      }
      const extraConfig = value[Table.Symbol.ExtraConfigBuilder]?.(value[Table.Symbol.ExtraConfigColumns]);
      if (extraConfig) {
        for (const configEntry of Object.values(extraConfig)) {
          if (is(configEntry, PrimaryKeyBuilder)) {
            tablesConfig[key].primaryKey.push(...configEntry.columns);
          }
        }
      }
    } else if (is(value, Relations)) {
      const dbName = getTableUniqueName(value.table);
      const tableName = tableNamesMap[dbName];
      const relations2 = value.config(
        configHelpers(value.table)
      );
      let primaryKey;
      for (const [relationName, relation] of Object.entries(relations2)) {
        if (tableName) {
          const tableConfig = tablesConfig[tableName];
          tableConfig.relations[relationName] = relation;
          if (primaryKey) {
            tableConfig.primaryKey.push(...primaryKey);
          }
        } else {
          if (!(dbName in relationsBuffer)) {
            relationsBuffer[dbName] = {
              relations: {},
              primaryKey
            };
          }
          relationsBuffer[dbName].relations[relationName] = relation;
        }
      }
    }
  }
  return { tables: tablesConfig, tableNamesMap };
}
function createOne(sourceTable) {
  return function one(table, config2) {
    return new One(
      sourceTable,
      table,
      config2,
      config2?.fields.reduce((res, f) => res && f.notNull, true) ?? false
    );
  };
}
function createMany(sourceTable) {
  return function many(referencedTable, config2) {
    return new Many(sourceTable, referencedTable, config2);
  };
}
function normalizeRelation(schema, tableNamesMap, relation) {
  if (is(relation, One) && relation.config) {
    return {
      fields: relation.config.fields,
      references: relation.config.references
    };
  }
  const referencedTableTsName = tableNamesMap[getTableUniqueName(relation.referencedTable)];
  if (!referencedTableTsName) {
    throw new Error(
      `Table "${relation.referencedTable[Table.Symbol.Name]}" not found in schema`
    );
  }
  const referencedTableConfig = schema[referencedTableTsName];
  if (!referencedTableConfig) {
    throw new Error(`Table "${referencedTableTsName}" not found in schema`);
  }
  const sourceTable = relation.sourceTable;
  const sourceTableTsName = tableNamesMap[getTableUniqueName(sourceTable)];
  if (!sourceTableTsName) {
    throw new Error(
      `Table "${sourceTable[Table.Symbol.Name]}" not found in schema`
    );
  }
  const reverseRelations = [];
  for (const referencedTableRelation of Object.values(
    referencedTableConfig.relations
  )) {
    if (relation.relationName && relation !== referencedTableRelation && referencedTableRelation.relationName === relation.relationName || !relation.relationName && referencedTableRelation.referencedTable === relation.sourceTable) {
      reverseRelations.push(referencedTableRelation);
    }
  }
  if (reverseRelations.length > 1) {
    throw relation.relationName ? new Error(
      `There are multiple relations with name "${relation.relationName}" in table "${referencedTableTsName}"`
    ) : new Error(
      `There are multiple relations between "${referencedTableTsName}" and "${relation.sourceTable[Table.Symbol.Name]}". Please specify relation name`
    );
  }
  if (reverseRelations[0] && is(reverseRelations[0], One) && reverseRelations[0].config) {
    return {
      fields: reverseRelations[0].config.references,
      references: reverseRelations[0].config.fields
    };
  }
  throw new Error(
    `There is not enough information to infer relation "${sourceTableTsName}.${relation.fieldName}"`
  );
}
function createTableRelationsHelpers(sourceTable) {
  return {
    one: createOne(sourceTable),
    many: createMany(sourceTable)
  };
}
function mapRelationalRow(tablesConfig, tableConfig, row, buildQueryResultSelection, mapColumnValue = (value) => value) {
  const result = {};
  for (const [
    selectionItemIndex,
    selectionItem
  ] of buildQueryResultSelection.entries()) {
    if (selectionItem.isJson) {
      const relation = tableConfig.relations[selectionItem.tsKey];
      const rawSubRows = row[selectionItemIndex];
      const subRows = typeof rawSubRows === "string" ? JSON.parse(rawSubRows) : rawSubRows;
      result[selectionItem.tsKey] = is(relation, One) ? subRows && mapRelationalRow(
        tablesConfig,
        tablesConfig[selectionItem.relationTableTsKey],
        subRows,
        selectionItem.selection,
        mapColumnValue
      ) : subRows.map(
        (subRow) => mapRelationalRow(
          tablesConfig,
          tablesConfig[selectionItem.relationTableTsKey],
          subRow,
          selectionItem.selection,
          mapColumnValue
        )
      );
    } else {
      const value = mapColumnValue(row[selectionItemIndex]);
      const field = selectionItem.field;
      let decoder;
      if (is(field, Column)) {
        decoder = field;
      } else if (is(field, SQL)) {
        decoder = field.decoder;
      } else {
        decoder = field.sql.decoder;
      }
      result[selectionItem.tsKey] = value === null ? null : decoder.mapFromDriverValue(value);
    }
  }
  return result;
}

// node_modules/drizzle-orm/mysql-core/foreign-keys.js
var ForeignKeyBuilder2 = class {
  static [entityKind] = "MySqlForeignKeyBuilder";
  /** @internal */
  reference;
  /** @internal */
  _onUpdate;
  /** @internal */
  _onDelete;
  constructor(config2, actions) {
    this.reference = () => {
      const { name, columns, foreignColumns } = config2();
      return { name, columns, foreignTable: foreignColumns[0].table, foreignColumns };
    };
    if (actions) {
      this._onUpdate = actions.onUpdate;
      this._onDelete = actions.onDelete;
    }
  }
  onUpdate(action) {
    this._onUpdate = action;
    return this;
  }
  onDelete(action) {
    this._onDelete = action;
    return this;
  }
  /** @internal */
  build(table) {
    return new ForeignKey2(table, this);
  }
};
var ForeignKey2 = class {
  constructor(table, builder) {
    this.table = table;
    this.reference = builder.reference;
    this.onUpdate = builder._onUpdate;
    this.onDelete = builder._onDelete;
  }
  static [entityKind] = "MySqlForeignKey";
  reference;
  onUpdate;
  onDelete;
  getName() {
    const { name, columns, foreignColumns } = this.reference();
    const columnNames = columns.map((column) => column.name);
    const foreignColumnNames = foreignColumns.map((column) => column.name);
    const chunks = [
      this.table[TableName],
      ...columnNames,
      foreignColumns[0].table[TableName],
      ...foreignColumnNames
    ];
    return name ?? `${chunks.join("_")}_fk`;
  }
};

// node_modules/drizzle-orm/mysql-core/unique-constraint.js
function uniqueKeyName2(table, columns) {
  return `${table[TableName]}_${columns.join("_")}_unique`;
}
var UniqueConstraintBuilder2 = class {
  constructor(columns, name) {
    this.name = name;
    this.columns = columns;
  }
  static [entityKind] = "MySqlUniqueConstraintBuilder";
  /** @internal */
  columns;
  /** @internal */
  build(table) {
    return new UniqueConstraint2(table, this.columns, this.name);
  }
};
var UniqueOnConstraintBuilder2 = class {
  static [entityKind] = "MySqlUniqueOnConstraintBuilder";
  /** @internal */
  name;
  constructor(name) {
    this.name = name;
  }
  on(...columns) {
    return new UniqueConstraintBuilder2(columns, this.name);
  }
};
var UniqueConstraint2 = class {
  constructor(table, columns, name) {
    this.table = table;
    this.columns = columns;
    this.name = name ?? uniqueKeyName2(this.table, this.columns.map((column) => column.name));
  }
  static [entityKind] = "MySqlUniqueConstraint";
  columns;
  name;
  nullsNotDistinct = false;
  getName() {
    return this.name;
  }
};

// node_modules/drizzle-orm/mysql-core/columns/common.js
var MySqlColumnBuilder = class extends ColumnBuilder {
  static [entityKind] = "MySqlColumnBuilder";
  foreignKeyConfigs = [];
  references(ref, actions = {}) {
    this.foreignKeyConfigs.push({ ref, actions });
    return this;
  }
  unique(name) {
    this.config.isUnique = true;
    this.config.uniqueName = name;
    return this;
  }
  generatedAlwaysAs(as, config2) {
    this.config.generated = {
      as,
      type: "always",
      mode: config2?.mode ?? "virtual"
    };
    return this;
  }
  /** @internal */
  buildForeignKeys(column, table) {
    return this.foreignKeyConfigs.map(({ ref, actions }) => {
      return ((ref2, actions2) => {
        const builder = new ForeignKeyBuilder2(() => {
          const foreignColumn = ref2();
          return { columns: [column], foreignColumns: [foreignColumn] };
        });
        if (actions2.onUpdate) {
          builder.onUpdate(actions2.onUpdate);
        }
        if (actions2.onDelete) {
          builder.onDelete(actions2.onDelete);
        }
        return builder.build(table);
      })(ref, actions);
    });
  }
};
var MySqlColumn = class extends Column {
  constructor(table, config2) {
    if (!config2.uniqueName) {
      config2.uniqueName = uniqueKeyName2(table, [config2.name]);
    }
    super(table, config2);
    this.table = table;
  }
  static [entityKind] = "MySqlColumn";
};
var MySqlColumnBuilderWithAutoIncrement = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlColumnBuilderWithAutoIncrement";
  constructor(name, dataType, columnType) {
    super(name, dataType, columnType);
    this.config.autoIncrement = false;
  }
  autoincrement() {
    this.config.autoIncrement = true;
    this.config.hasDefault = true;
    return this;
  }
};
var MySqlColumnWithAutoIncrement = class extends MySqlColumn {
  static [entityKind] = "MySqlColumnWithAutoIncrement";
  autoIncrement = this.config.autoIncrement;
};

// node_modules/drizzle-orm/mysql-core/columns/bigint.js
var MySqlBigInt53Builder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlBigInt53Builder";
  constructor(name, unsigned = false) {
    super(name, "number", "MySqlBigInt53");
    this.config.unsigned = unsigned;
  }
  /** @internal */
  build(table) {
    return new MySqlBigInt53(
      table,
      this.config
    );
  }
};
var MySqlBigInt53 = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlBigInt53";
  getSQLType() {
    return `bigint${this.config.unsigned ? " unsigned" : ""}`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "number") {
      return value;
    }
    return Number(value);
  }
};
var MySqlBigInt64Builder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlBigInt64Builder";
  constructor(name, unsigned = false) {
    super(name, "bigint", "MySqlBigInt64");
    this.config.unsigned = unsigned;
  }
  /** @internal */
  build(table) {
    return new MySqlBigInt64(
      table,
      this.config
    );
  }
};
var MySqlBigInt64 = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlBigInt64";
  getSQLType() {
    return `bigint${this.config.unsigned ? " unsigned" : ""}`;
  }
  // eslint-disable-next-line unicorn/prefer-native-coercion-functions
  mapFromDriverValue(value) {
    return BigInt(value);
  }
};
function bigint(a, b) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  if (config2.mode === "number") {
    return new MySqlBigInt53Builder(name, config2.unsigned);
  }
  return new MySqlBigInt64Builder(name, config2.unsigned);
}

// node_modules/drizzle-orm/mysql-core/columns/binary.js
var MySqlBinaryBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlBinaryBuilder";
  constructor(name, length) {
    super(name, "string", "MySqlBinary");
    this.config.length = length;
  }
  /** @internal */
  build(table) {
    return new MySqlBinary(table, this.config);
  }
};
var MySqlBinary = class extends MySqlColumn {
  static [entityKind] = "MySqlBinary";
  length = this.config.length;
  getSQLType() {
    return this.length === void 0 ? `binary` : `binary(${this.length})`;
  }
};
function binary(a, b = {}) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  return new MySqlBinaryBuilder(name, config2.length);
}

// node_modules/drizzle-orm/mysql-core/columns/boolean.js
var MySqlBooleanBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlBooleanBuilder";
  constructor(name) {
    super(name, "boolean", "MySqlBoolean");
  }
  /** @internal */
  build(table) {
    return new MySqlBoolean(
      table,
      this.config
    );
  }
};
var MySqlBoolean = class extends MySqlColumn {
  static [entityKind] = "MySqlBoolean";
  getSQLType() {
    return "boolean";
  }
  mapFromDriverValue(value) {
    if (typeof value === "boolean") {
      return value;
    }
    return value === 1;
  }
};
function boolean(name) {
  return new MySqlBooleanBuilder(name ?? "");
}

// node_modules/drizzle-orm/mysql-core/columns/char.js
var MySqlCharBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlCharBuilder";
  constructor(name, config2) {
    super(name, "string", "MySqlChar");
    this.config.length = config2.length;
    this.config.enum = config2.enum;
  }
  /** @internal */
  build(table) {
    return new MySqlChar(
      table,
      this.config
    );
  }
};
var MySqlChar = class extends MySqlColumn {
  static [entityKind] = "MySqlChar";
  length = this.config.length;
  enumValues = this.config.enum;
  getSQLType() {
    return this.length === void 0 ? `char` : `char(${this.length})`;
  }
};
function char(a, b = {}) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  return new MySqlCharBuilder(name, config2);
}

// node_modules/drizzle-orm/mysql-core/columns/custom.js
var MySqlCustomColumnBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlCustomColumnBuilder";
  constructor(name, fieldConfig, customTypeParams) {
    super(name, "custom", "MySqlCustomColumn");
    this.config.fieldConfig = fieldConfig;
    this.config.customTypeParams = customTypeParams;
  }
  /** @internal */
  build(table) {
    return new MySqlCustomColumn(
      table,
      this.config
    );
  }
};
var MySqlCustomColumn = class extends MySqlColumn {
  static [entityKind] = "MySqlCustomColumn";
  sqlName;
  mapTo;
  mapFrom;
  constructor(table, config2) {
    super(table, config2);
    this.sqlName = config2.customTypeParams.dataType(config2.fieldConfig);
    this.mapTo = config2.customTypeParams.toDriver;
    this.mapFrom = config2.customTypeParams.fromDriver;
  }
  getSQLType() {
    return this.sqlName;
  }
  mapFromDriverValue(value) {
    return typeof this.mapFrom === "function" ? this.mapFrom(value) : value;
  }
  mapToDriverValue(value) {
    return typeof this.mapTo === "function" ? this.mapTo(value) : value;
  }
};
function customType(customTypeParams) {
  return (a, b) => {
    const { name, config: config2 } = getColumnNameAndConfig(a, b);
    return new MySqlCustomColumnBuilder(name, config2, customTypeParams);
  };
}

// node_modules/drizzle-orm/mysql-core/columns/date.js
var MySqlDateBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlDateBuilder";
  constructor(name) {
    super(name, "date", "MySqlDate");
  }
  /** @internal */
  build(table) {
    return new MySqlDate(table, this.config);
  }
};
var MySqlDate = class extends MySqlColumn {
  static [entityKind] = "MySqlDate";
  constructor(table, config2) {
    super(table, config2);
  }
  getSQLType() {
    return `date`;
  }
  mapFromDriverValue(value) {
    return new Date(value);
  }
};
var MySqlDateStringBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlDateStringBuilder";
  constructor(name) {
    super(name, "string", "MySqlDateString");
  }
  /** @internal */
  build(table) {
    return new MySqlDateString(
      table,
      this.config
    );
  }
};
var MySqlDateString = class extends MySqlColumn {
  static [entityKind] = "MySqlDateString";
  constructor(table, config2) {
    super(table, config2);
  }
  getSQLType() {
    return `date`;
  }
};
function date(a, b) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  if (config2?.mode === "string") {
    return new MySqlDateStringBuilder(name);
  }
  return new MySqlDateBuilder(name);
}

// node_modules/drizzle-orm/mysql-core/columns/datetime.js
var MySqlDateTimeBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlDateTimeBuilder";
  constructor(name, config2) {
    super(name, "date", "MySqlDateTime");
    this.config.fsp = config2?.fsp;
  }
  /** @internal */
  build(table) {
    return new MySqlDateTime(
      table,
      this.config
    );
  }
};
var MySqlDateTime = class extends MySqlColumn {
  static [entityKind] = "MySqlDateTime";
  fsp;
  constructor(table, config2) {
    super(table, config2);
    this.fsp = config2.fsp;
  }
  getSQLType() {
    const precision = this.fsp === void 0 ? "" : `(${this.fsp})`;
    return `datetime${precision}`;
  }
  mapToDriverValue(value) {
    return value.toISOString().replace("T", " ").replace("Z", "");
  }
  mapFromDriverValue(value) {
    return /* @__PURE__ */ new Date(value.replace(" ", "T") + "Z");
  }
};
var MySqlDateTimeStringBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlDateTimeStringBuilder";
  constructor(name, config2) {
    super(name, "string", "MySqlDateTimeString");
    this.config.fsp = config2?.fsp;
  }
  /** @internal */
  build(table) {
    return new MySqlDateTimeString(
      table,
      this.config
    );
  }
};
var MySqlDateTimeString = class extends MySqlColumn {
  static [entityKind] = "MySqlDateTimeString";
  fsp;
  constructor(table, config2) {
    super(table, config2);
    this.fsp = config2.fsp;
  }
  getSQLType() {
    const precision = this.fsp === void 0 ? "" : `(${this.fsp})`;
    return `datetime${precision}`;
  }
};
function datetime(a, b) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  if (config2?.mode === "string") {
    return new MySqlDateTimeStringBuilder(name, config2);
  }
  return new MySqlDateTimeBuilder(name, config2);
}

// node_modules/drizzle-orm/mysql-core/columns/decimal.js
var MySqlDecimalBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlDecimalBuilder";
  constructor(name, config2) {
    super(name, "string", "MySqlDecimal");
    this.config.precision = config2?.precision;
    this.config.scale = config2?.scale;
    this.config.unsigned = config2?.unsigned;
  }
  /** @internal */
  build(table) {
    return new MySqlDecimal(
      table,
      this.config
    );
  }
};
var MySqlDecimal = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlDecimal";
  precision = this.config.precision;
  scale = this.config.scale;
  unsigned = this.config.unsigned;
  getSQLType() {
    let type = "";
    if (this.precision !== void 0 && this.scale !== void 0) {
      type += `decimal(${this.precision},${this.scale})`;
    } else if (this.precision === void 0) {
      type += "decimal";
    } else {
      type += `decimal(${this.precision})`;
    }
    type = type === "decimal(10,0)" || type === "decimal(10)" ? "decimal" : type;
    return this.unsigned ? `${type} unsigned` : type;
  }
};
function decimal(a, b = {}) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  return new MySqlDecimalBuilder(name, config2);
}

// node_modules/drizzle-orm/mysql-core/columns/double.js
var MySqlDoubleBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlDoubleBuilder";
  constructor(name, config2) {
    super(name, "number", "MySqlDouble");
    this.config.precision = config2?.precision;
    this.config.scale = config2?.scale;
    this.config.unsigned = config2?.unsigned;
  }
  /** @internal */
  build(table) {
    return new MySqlDouble(table, this.config);
  }
};
var MySqlDouble = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlDouble";
  precision = this.config.precision;
  scale = this.config.scale;
  unsigned = this.config.unsigned;
  getSQLType() {
    let type = "";
    if (this.precision !== void 0 && this.scale !== void 0) {
      type += `double(${this.precision},${this.scale})`;
    } else if (this.precision === void 0) {
      type += "double";
    } else {
      type += `double(${this.precision})`;
    }
    return this.unsigned ? `${type} unsigned` : type;
  }
};
function double(a, b) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  return new MySqlDoubleBuilder(name, config2);
}

// node_modules/drizzle-orm/mysql-core/columns/enum.js
var MySqlEnumColumnBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlEnumColumnBuilder";
  constructor(name, values) {
    super(name, "string", "MySqlEnumColumn");
    this.config.enumValues = values;
  }
  /** @internal */
  build(table) {
    return new MySqlEnumColumn(
      table,
      this.config
    );
  }
};
var MySqlEnumColumn = class extends MySqlColumn {
  static [entityKind] = "MySqlEnumColumn";
  enumValues = this.config.enumValues;
  getSQLType() {
    return `enum(${this.enumValues.map((value) => `'${value}'`).join(",")})`;
  }
};
function mysqlEnum(a, b) {
  const { name, config: values } = getColumnNameAndConfig(a, b);
  if (values.length === 0) {
    throw new Error(`You have an empty array for "${name}" enum values`);
  }
  return new MySqlEnumColumnBuilder(name, values);
}

// node_modules/drizzle-orm/mysql-core/columns/float.js
var MySqlFloatBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlFloatBuilder";
  constructor(name, config2) {
    super(name, "number", "MySqlFloat");
    this.config.precision = config2?.precision;
    this.config.scale = config2?.scale;
    this.config.unsigned = config2?.unsigned;
  }
  /** @internal */
  build(table) {
    return new MySqlFloat(table, this.config);
  }
};
var MySqlFloat = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlFloat";
  precision = this.config.precision;
  scale = this.config.scale;
  unsigned = this.config.unsigned;
  getSQLType() {
    let type = "";
    if (this.precision !== void 0 && this.scale !== void 0) {
      type += `float(${this.precision},${this.scale})`;
    } else if (this.precision === void 0) {
      type += "float";
    } else {
      type += `float(${this.precision})`;
    }
    return this.unsigned ? `${type} unsigned` : type;
  }
};
function float(a, b) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  return new MySqlFloatBuilder(name, config2);
}

// node_modules/drizzle-orm/mysql-core/columns/int.js
var MySqlIntBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlIntBuilder";
  constructor(name, config2) {
    super(name, "number", "MySqlInt");
    this.config.unsigned = config2 ? config2.unsigned : false;
  }
  /** @internal */
  build(table) {
    return new MySqlInt(table, this.config);
  }
};
var MySqlInt = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlInt";
  getSQLType() {
    return `int${this.config.unsigned ? " unsigned" : ""}`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number(value);
    }
    return value;
  }
};
function int(a, b) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  return new MySqlIntBuilder(name, config2);
}

// node_modules/drizzle-orm/mysql-core/columns/json.js
var MySqlJsonBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlJsonBuilder";
  constructor(name) {
    super(name, "json", "MySqlJson");
  }
  /** @internal */
  build(table) {
    return new MySqlJson(table, this.config);
  }
};
var MySqlJson = class extends MySqlColumn {
  static [entityKind] = "MySqlJson";
  getSQLType() {
    return "json";
  }
  mapToDriverValue(value) {
    return JSON.stringify(value);
  }
};
function json(name) {
  return new MySqlJsonBuilder(name ?? "");
}

// node_modules/drizzle-orm/mysql-core/columns/mediumint.js
var MySqlMediumIntBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlMediumIntBuilder";
  constructor(name, config2) {
    super(name, "number", "MySqlMediumInt");
    this.config.unsigned = config2 ? config2.unsigned : false;
  }
  /** @internal */
  build(table) {
    return new MySqlMediumInt(
      table,
      this.config
    );
  }
};
var MySqlMediumInt = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlMediumInt";
  getSQLType() {
    return `mediumint${this.config.unsigned ? " unsigned" : ""}`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number(value);
    }
    return value;
  }
};
function mediumint(a, b) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  return new MySqlMediumIntBuilder(name, config2);
}

// node_modules/drizzle-orm/mysql-core/columns/real.js
var MySqlRealBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlRealBuilder";
  constructor(name, config2) {
    super(name, "number", "MySqlReal");
    this.config.precision = config2?.precision;
    this.config.scale = config2?.scale;
  }
  /** @internal */
  build(table) {
    return new MySqlReal(table, this.config);
  }
};
var MySqlReal = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlReal";
  precision = this.config.precision;
  scale = this.config.scale;
  getSQLType() {
    if (this.precision !== void 0 && this.scale !== void 0) {
      return `real(${this.precision}, ${this.scale})`;
    } else if (this.precision === void 0) {
      return "real";
    } else {
      return `real(${this.precision})`;
    }
  }
};
function real(a, b = {}) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  return new MySqlRealBuilder(name, config2);
}

// node_modules/drizzle-orm/mysql-core/columns/serial.js
var MySqlSerialBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlSerialBuilder";
  constructor(name) {
    super(name, "number", "MySqlSerial");
    this.config.hasDefault = true;
    this.config.autoIncrement = true;
  }
  /** @internal */
  build(table) {
    return new MySqlSerial(table, this.config);
  }
};
var MySqlSerial = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlSerial";
  getSQLType() {
    return "serial";
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number(value);
    }
    return value;
  }
};
function serial(name) {
  return new MySqlSerialBuilder(name ?? "");
}

// node_modules/drizzle-orm/mysql-core/columns/smallint.js
var MySqlSmallIntBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlSmallIntBuilder";
  constructor(name, config2) {
    super(name, "number", "MySqlSmallInt");
    this.config.unsigned = config2 ? config2.unsigned : false;
  }
  /** @internal */
  build(table) {
    return new MySqlSmallInt(
      table,
      this.config
    );
  }
};
var MySqlSmallInt = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlSmallInt";
  getSQLType() {
    return `smallint${this.config.unsigned ? " unsigned" : ""}`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number(value);
    }
    return value;
  }
};
function smallint(a, b) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  return new MySqlSmallIntBuilder(name, config2);
}

// node_modules/drizzle-orm/mysql-core/columns/text.js
var MySqlTextBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlTextBuilder";
  constructor(name, textType, config2) {
    super(name, "string", "MySqlText");
    this.config.textType = textType;
    this.config.enumValues = config2.enum;
  }
  /** @internal */
  build(table) {
    return new MySqlText(table, this.config);
  }
};
var MySqlText = class extends MySqlColumn {
  static [entityKind] = "MySqlText";
  textType = this.config.textType;
  enumValues = this.config.enumValues;
  getSQLType() {
    return this.textType;
  }
};
function text(a, b = {}) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  return new MySqlTextBuilder(name, "text", config2);
}
function tinytext(a, b = {}) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  return new MySqlTextBuilder(name, "tinytext", config2);
}
function mediumtext(a, b = {}) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  return new MySqlTextBuilder(name, "mediumtext", config2);
}
function longtext(a, b = {}) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  return new MySqlTextBuilder(name, "longtext", config2);
}

// node_modules/drizzle-orm/mysql-core/columns/time.js
var MySqlTimeBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlTimeBuilder";
  constructor(name, config2) {
    super(name, "string", "MySqlTime");
    this.config.fsp = config2?.fsp;
  }
  /** @internal */
  build(table) {
    return new MySqlTime(table, this.config);
  }
};
var MySqlTime = class extends MySqlColumn {
  static [entityKind] = "MySqlTime";
  fsp = this.config.fsp;
  getSQLType() {
    const precision = this.fsp === void 0 ? "" : `(${this.fsp})`;
    return `time${precision}`;
  }
};
function time(a, b) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  return new MySqlTimeBuilder(name, config2);
}

// node_modules/drizzle-orm/mysql-core/columns/date.common.js
var MySqlDateColumnBaseBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlDateColumnBuilder";
  defaultNow() {
    return this.default(sql`(now())`);
  }
  // "on update now" also adds an implicit default value to the column - https://dev.mysql.com/doc/refman/8.0/en/timestamp-initialization.html
  onUpdateNow() {
    this.config.hasOnUpdateNow = true;
    this.config.hasDefault = true;
    return this;
  }
};
var MySqlDateBaseColumn = class extends MySqlColumn {
  static [entityKind] = "MySqlDateColumn";
  hasOnUpdateNow = this.config.hasOnUpdateNow;
};

// node_modules/drizzle-orm/mysql-core/columns/timestamp.js
var MySqlTimestampBuilder = class extends MySqlDateColumnBaseBuilder {
  static [entityKind] = "MySqlTimestampBuilder";
  constructor(name, config2) {
    super(name, "date", "MySqlTimestamp");
    this.config.fsp = config2?.fsp;
  }
  /** @internal */
  build(table) {
    return new MySqlTimestamp(
      table,
      this.config
    );
  }
};
var MySqlTimestamp = class extends MySqlDateBaseColumn {
  static [entityKind] = "MySqlTimestamp";
  fsp = this.config.fsp;
  getSQLType() {
    const precision = this.fsp === void 0 ? "" : `(${this.fsp})`;
    return `timestamp${precision}`;
  }
  mapFromDriverValue(value) {
    return /* @__PURE__ */ new Date(value + "+0000");
  }
  mapToDriverValue(value) {
    return value.toISOString().slice(0, -1).replace("T", " ");
  }
};
var MySqlTimestampStringBuilder = class extends MySqlDateColumnBaseBuilder {
  static [entityKind] = "MySqlTimestampStringBuilder";
  constructor(name, config2) {
    super(name, "string", "MySqlTimestampString");
    this.config.fsp = config2?.fsp;
  }
  /** @internal */
  build(table) {
    return new MySqlTimestampString(
      table,
      this.config
    );
  }
};
var MySqlTimestampString = class extends MySqlDateBaseColumn {
  static [entityKind] = "MySqlTimestampString";
  fsp = this.config.fsp;
  getSQLType() {
    const precision = this.fsp === void 0 ? "" : `(${this.fsp})`;
    return `timestamp${precision}`;
  }
};
function timestamp(a, b = {}) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  if (config2?.mode === "string") {
    return new MySqlTimestampStringBuilder(name, config2);
  }
  return new MySqlTimestampBuilder(name, config2);
}

// node_modules/drizzle-orm/mysql-core/columns/tinyint.js
var MySqlTinyIntBuilder = class extends MySqlColumnBuilderWithAutoIncrement {
  static [entityKind] = "MySqlTinyIntBuilder";
  constructor(name, config2) {
    super(name, "number", "MySqlTinyInt");
    this.config.unsigned = config2 ? config2.unsigned : false;
  }
  /** @internal */
  build(table) {
    return new MySqlTinyInt(
      table,
      this.config
    );
  }
};
var MySqlTinyInt = class extends MySqlColumnWithAutoIncrement {
  static [entityKind] = "MySqlTinyInt";
  getSQLType() {
    return `tinyint${this.config.unsigned ? " unsigned" : ""}`;
  }
  mapFromDriverValue(value) {
    if (typeof value === "string") {
      return Number(value);
    }
    return value;
  }
};
function tinyint(a, b) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  return new MySqlTinyIntBuilder(name, config2);
}

// node_modules/drizzle-orm/mysql-core/columns/varbinary.js
var MySqlVarBinaryBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlVarBinaryBuilder";
  /** @internal */
  constructor(name, config2) {
    super(name, "string", "MySqlVarBinary");
    this.config.length = config2?.length;
  }
  /** @internal */
  build(table) {
    return new MySqlVarBinary(
      table,
      this.config
    );
  }
};
var MySqlVarBinary = class extends MySqlColumn {
  static [entityKind] = "MySqlVarBinary";
  length = this.config.length;
  getSQLType() {
    return this.length === void 0 ? `varbinary` : `varbinary(${this.length})`;
  }
};
function varbinary(a, b) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  return new MySqlVarBinaryBuilder(name, config2);
}

// node_modules/drizzle-orm/mysql-core/columns/varchar.js
var MySqlVarCharBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlVarCharBuilder";
  /** @internal */
  constructor(name, config2) {
    super(name, "string", "MySqlVarChar");
    this.config.length = config2.length;
    this.config.enum = config2.enum;
  }
  /** @internal */
  build(table) {
    return new MySqlVarChar(
      table,
      this.config
    );
  }
};
var MySqlVarChar = class extends MySqlColumn {
  static [entityKind] = "MySqlVarChar";
  length = this.config.length;
  enumValues = this.config.enum;
  getSQLType() {
    return this.length === void 0 ? `varchar` : `varchar(${this.length})`;
  }
};
function varchar(a, b) {
  const { name, config: config2 } = getColumnNameAndConfig(a, b);
  return new MySqlVarCharBuilder(name, config2);
}

// node_modules/drizzle-orm/mysql-core/columns/year.js
var MySqlYearBuilder = class extends MySqlColumnBuilder {
  static [entityKind] = "MySqlYearBuilder";
  constructor(name) {
    super(name, "number", "MySqlYear");
  }
  /** @internal */
  build(table) {
    return new MySqlYear(table, this.config);
  }
};
var MySqlYear = class extends MySqlColumn {
  static [entityKind] = "MySqlYear";
  getSQLType() {
    return `year`;
  }
};
function year(name) {
  return new MySqlYearBuilder(name ?? "");
}

// node_modules/drizzle-orm/mysql-core/columns/all.js
function getMySqlColumnBuilders() {
  return {
    bigint,
    binary,
    boolean,
    char,
    customType,
    date,
    datetime,
    decimal,
    double,
    mysqlEnum,
    float,
    int,
    json,
    mediumint,
    real,
    serial,
    smallint,
    text,
    time,
    timestamp,
    tinyint,
    varbinary,
    varchar,
    year,
    longtext,
    mediumtext,
    tinytext
  };
}

// node_modules/drizzle-orm/mysql-core/table.js
var InlineForeignKeys2 = Symbol.for("drizzle:MySqlInlineForeignKeys");
var MySqlTable = class extends Table {
  static [entityKind] = "MySqlTable";
  /** @internal */
  static Symbol = Object.assign({}, Table.Symbol, {
    InlineForeignKeys: InlineForeignKeys2
  });
  /** @internal */
  [Table.Symbol.Columns];
  /** @internal */
  [InlineForeignKeys2] = [];
  /** @internal */
  [Table.Symbol.ExtraConfigBuilder] = void 0;
};
function mysqlTableWithSchema(name, columns, extraConfig, schema, baseName = name) {
  const rawTable = new MySqlTable(name, schema, baseName);
  const parsedColumns = typeof columns === "function" ? columns(getMySqlColumnBuilders()) : columns;
  const builtColumns = Object.fromEntries(
    Object.entries(parsedColumns).map(([name2, colBuilderBase]) => {
      const colBuilder = colBuilderBase;
      colBuilder.setName(name2);
      const column = colBuilder.build(rawTable);
      rawTable[InlineForeignKeys2].push(...colBuilder.buildForeignKeys(column, rawTable));
      return [name2, column];
    })
  );
  const table = Object.assign(rawTable, builtColumns);
  table[Table.Symbol.Columns] = builtColumns;
  table[Table.Symbol.ExtraConfigColumns] = builtColumns;
  if (extraConfig) {
    table[MySqlTable.Symbol.ExtraConfigBuilder] = extraConfig;
  }
  return table;
}
var mysqlTable = (name, columns, extraConfig) => {
  return mysqlTableWithSchema(name, columns, extraConfig, void 0, name);
};

// node_modules/drizzle-orm/mysql-core/view-base.js
var MySqlViewBase = class extends View {
  static [entityKind] = "MySqlViewBase";
};

// node_modules/drizzle-orm/mysql-core/dialect.js
var MySqlDialect = class {
  static [entityKind] = "MySqlDialect";
  /** @internal */
  casing;
  constructor(config2) {
    this.casing = new CasingCache(config2?.casing);
  }
  async migrate(migrations, session, config2) {
    const migrationsTable = config2.migrationsTable ?? "__drizzle_migrations";
    const migrationTableCreate = sql`
			create table if not exists ${sql.identifier(migrationsTable)} (
				id serial primary key,
				hash text not null,
				created_at bigint
			)
		`;
    await session.execute(migrationTableCreate);
    const dbMigrations = await session.all(
      sql`select id, hash, created_at from ${sql.identifier(migrationsTable)} order by created_at desc limit 1`
    );
    const lastDbMigration = dbMigrations[0];
    await session.transaction(async (tx) => {
      for (const migration of migrations) {
        if (!lastDbMigration || Number(lastDbMigration.created_at) < migration.folderMillis) {
          for (const stmt of migration.sql) {
            await tx.execute(sql.raw(stmt));
          }
          await tx.execute(
            sql`insert into ${sql.identifier(migrationsTable)} (\`hash\`, \`created_at\`) values(${migration.hash}, ${migration.folderMillis})`
          );
        }
      }
    });
  }
  escapeName(name) {
    return `\`${name}\``;
  }
  escapeParam(_num) {
    return `?`;
  }
  escapeString(str) {
    return `'${str.replace(/'/g, "''")}'`;
  }
  buildWithCTE(queries) {
    if (!queries?.length)
      return void 0;
    const withSqlChunks = [sql`with `];
    for (const [i, w] of queries.entries()) {
      withSqlChunks.push(sql`${sql.identifier(w._.alias)} as (${w._.sql})`);
      if (i < queries.length - 1) {
        withSqlChunks.push(sql`, `);
      }
    }
    withSqlChunks.push(sql` `);
    return sql.join(withSqlChunks);
  }
  buildDeleteQuery({ table, where, returning, withList, limit, orderBy }) {
    const withSql = this.buildWithCTE(withList);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
    const whereSql = where ? sql` where ${where}` : void 0;
    const orderBySql = this.buildOrderBy(orderBy);
    const limitSql = this.buildLimit(limit);
    return sql`${withSql}delete from ${table}${whereSql}${orderBySql}${limitSql}${returningSql}`;
  }
  buildUpdateSet(table, set) {
    const tableColumns = table[Table.Symbol.Columns];
    const columnNames = Object.keys(tableColumns).filter(
      (colName) => set[colName] !== void 0 || tableColumns[colName]?.onUpdateFn !== void 0
    );
    const setSize = columnNames.length;
    return sql.join(columnNames.flatMap((colName, i) => {
      const col = tableColumns[colName];
      const value = set[colName] ?? sql.param(col.onUpdateFn(), col);
      const res = sql`${sql.identifier(this.casing.getColumnCasing(col))} = ${value}`;
      if (i < setSize - 1) {
        return [res, sql.raw(", ")];
      }
      return [res];
    }));
  }
  buildUpdateQuery({ table, set, where, returning, withList, limit, orderBy }) {
    const withSql = this.buildWithCTE(withList);
    const setSql = this.buildUpdateSet(table, set);
    const returningSql = returning ? sql` returning ${this.buildSelection(returning, { isSingleTable: true })}` : void 0;
    const whereSql = where ? sql` where ${where}` : void 0;
    const orderBySql = this.buildOrderBy(orderBy);
    const limitSql = this.buildLimit(limit);
    return sql`${withSql}update ${table} set ${setSql}${whereSql}${orderBySql}${limitSql}${returningSql}`;
  }
  /**
   * Builds selection SQL with provided fields/expressions
   *
   * Examples:
   *
   * `select <selection> from`
   *
   * `insert ... returning <selection>`
   *
   * If `isSingleTable` is true, then columns won't be prefixed with table name
   */
  buildSelection(fields, { isSingleTable = false } = {}) {
    const columnsLen = fields.length;
    const chunks = fields.flatMap(({ field }, i) => {
      const chunk = [];
      if (is(field, SQL.Aliased) && field.isSelectionField) {
        chunk.push(sql.identifier(field.fieldAlias));
      } else if (is(field, SQL.Aliased) || is(field, SQL)) {
        const query = is(field, SQL.Aliased) ? field.sql : field;
        if (isSingleTable) {
          chunk.push(
            new SQL(
              query.queryChunks.map((c) => {
                if (is(c, MySqlColumn)) {
                  return sql.identifier(this.casing.getColumnCasing(c));
                }
                return c;
              })
            )
          );
        } else {
          chunk.push(query);
        }
        if (is(field, SQL.Aliased)) {
          chunk.push(sql` as ${sql.identifier(field.fieldAlias)}`);
        }
      } else if (is(field, Column)) {
        if (isSingleTable) {
          chunk.push(sql.identifier(this.casing.getColumnCasing(field)));
        } else {
          chunk.push(field);
        }
      }
      if (i < columnsLen - 1) {
        chunk.push(sql`, `);
      }
      return chunk;
    });
    return sql.join(chunks);
  }
  buildLimit(limit) {
    return typeof limit === "object" || typeof limit === "number" && limit >= 0 ? sql` limit ${limit}` : void 0;
  }
  buildOrderBy(orderBy) {
    return orderBy && orderBy.length > 0 ? sql` order by ${sql.join(orderBy, sql`, `)}` : void 0;
  }
  buildIndex({
    indexes,
    indexFor
  }) {
    return indexes && indexes.length > 0 ? sql` ${sql.raw(indexFor)} INDEX (${sql.raw(indexes.join(`, `))})` : void 0;
  }
  buildSelectQuery({
    withList,
    fields,
    fieldsFlat,
    where,
    having,
    table,
    joins,
    orderBy,
    groupBy,
    limit,
    offset,
    lockingClause,
    distinct,
    setOperators,
    useIndex,
    forceIndex,
    ignoreIndex
  }) {
    const fieldsList = fieldsFlat ?? orderSelectedFields(fields);
    for (const f of fieldsList) {
      if (is(f.field, Column) && getTableName(f.field.table) !== (is(table, Subquery) ? table._.alias : is(table, MySqlViewBase) ? table[ViewBaseConfig].name : is(table, SQL) ? void 0 : getTableName(table)) && !((table2) => joins?.some(
        ({ alias }) => alias === (table2[Table.Symbol.IsAlias] ? getTableName(table2) : table2[Table.Symbol.BaseName])
      ))(f.field.table)) {
        const tableName = getTableName(f.field.table);
        throw new Error(
          `Your "${f.path.join("->")}" field references a column "${tableName}"."${f.field.name}", but the table "${tableName}" is not part of the query! Did you forget to join it?`
        );
      }
    }
    const isSingleTable = !joins || joins.length === 0;
    const withSql = this.buildWithCTE(withList);
    const distinctSql = distinct ? sql` distinct` : void 0;
    const selection = this.buildSelection(fieldsList, { isSingleTable });
    const tableSql = (() => {
      if (is(table, Table) && table[Table.Symbol.OriginalName] !== table[Table.Symbol.Name]) {
        return sql`${sql.identifier(table[Table.Symbol.OriginalName])} ${sql.identifier(table[Table.Symbol.Name])}`;
      }
      return table;
    })();
    const joinsArray = [];
    if (joins) {
      for (const [index, joinMeta] of joins.entries()) {
        if (index === 0) {
          joinsArray.push(sql` `);
        }
        const table2 = joinMeta.table;
        const lateralSql = joinMeta.lateral ? sql` lateral` : void 0;
        if (is(table2, MySqlTable)) {
          const tableName = table2[MySqlTable.Symbol.Name];
          const tableSchema = table2[MySqlTable.Symbol.Schema];
          const origTableName = table2[MySqlTable.Symbol.OriginalName];
          const alias = tableName === origTableName ? void 0 : joinMeta.alias;
          const useIndexSql2 = this.buildIndex({ indexes: joinMeta.useIndex, indexFor: "USE" });
          const forceIndexSql2 = this.buildIndex({ indexes: joinMeta.forceIndex, indexFor: "FORCE" });
          const ignoreIndexSql2 = this.buildIndex({ indexes: joinMeta.ignoreIndex, indexFor: "IGNORE" });
          joinsArray.push(
            sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${tableSchema ? sql`${sql.identifier(tableSchema)}.` : void 0}${sql.identifier(origTableName)}${useIndexSql2}${forceIndexSql2}${ignoreIndexSql2}${alias && sql` ${sql.identifier(alias)}`} on ${joinMeta.on}`
          );
        } else if (is(table2, View)) {
          const viewName = table2[ViewBaseConfig].name;
          const viewSchema = table2[ViewBaseConfig].schema;
          const origViewName = table2[ViewBaseConfig].originalName;
          const alias = viewName === origViewName ? void 0 : joinMeta.alias;
          joinsArray.push(
            sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${viewSchema ? sql`${sql.identifier(viewSchema)}.` : void 0}${sql.identifier(origViewName)}${alias && sql` ${sql.identifier(alias)}`} on ${joinMeta.on}`
          );
        } else {
          joinsArray.push(
            sql`${sql.raw(joinMeta.joinType)} join${lateralSql} ${table2} on ${joinMeta.on}`
          );
        }
        if (index < joins.length - 1) {
          joinsArray.push(sql` `);
        }
      }
    }
    const joinsSql = sql.join(joinsArray);
    const whereSql = where ? sql` where ${where}` : void 0;
    const havingSql = having ? sql` having ${having}` : void 0;
    const orderBySql = this.buildOrderBy(orderBy);
    const groupBySql = groupBy && groupBy.length > 0 ? sql` group by ${sql.join(groupBy, sql`, `)}` : void 0;
    const limitSql = this.buildLimit(limit);
    const offsetSql = offset ? sql` offset ${offset}` : void 0;
    const useIndexSql = this.buildIndex({ indexes: useIndex, indexFor: "USE" });
    const forceIndexSql = this.buildIndex({ indexes: forceIndex, indexFor: "FORCE" });
    const ignoreIndexSql = this.buildIndex({ indexes: ignoreIndex, indexFor: "IGNORE" });
    let lockingClausesSql;
    if (lockingClause) {
      const { config: config2, strength } = lockingClause;
      lockingClausesSql = sql` for ${sql.raw(strength)}`;
      if (config2.noWait) {
        lockingClausesSql.append(sql` no wait`);
      } else if (config2.skipLocked) {
        lockingClausesSql.append(sql` skip locked`);
      }
    }
    const finalQuery = sql`${withSql}select${distinctSql} ${selection} from ${tableSql}${useIndexSql}${forceIndexSql}${ignoreIndexSql}${joinsSql}${whereSql}${groupBySql}${havingSql}${orderBySql}${limitSql}${offsetSql}${lockingClausesSql}`;
    if (setOperators.length > 0) {
      return this.buildSetOperations(finalQuery, setOperators);
    }
    return finalQuery;
  }
  buildSetOperations(leftSelect, setOperators) {
    const [setOperator, ...rest] = setOperators;
    if (!setOperator) {
      throw new Error("Cannot pass undefined values to any set operator");
    }
    if (rest.length === 0) {
      return this.buildSetOperationQuery({ leftSelect, setOperator });
    }
    return this.buildSetOperations(
      this.buildSetOperationQuery({ leftSelect, setOperator }),
      rest
    );
  }
  buildSetOperationQuery({
    leftSelect,
    setOperator: { type, isAll, rightSelect, limit, orderBy, offset }
  }) {
    const leftChunk = sql`(${leftSelect.getSQL()}) `;
    const rightChunk = sql`(${rightSelect.getSQL()})`;
    let orderBySql;
    if (orderBy && orderBy.length > 0) {
      const orderByValues = [];
      for (const orderByUnit of orderBy) {
        if (is(orderByUnit, MySqlColumn)) {
          orderByValues.push(sql.identifier(this.casing.getColumnCasing(orderByUnit)));
        } else if (is(orderByUnit, SQL)) {
          for (let i = 0; i < orderByUnit.queryChunks.length; i++) {
            const chunk = orderByUnit.queryChunks[i];
            if (is(chunk, MySqlColumn)) {
              orderByUnit.queryChunks[i] = sql.identifier(this.casing.getColumnCasing(chunk));
            }
          }
          orderByValues.push(sql`${orderByUnit}`);
        } else {
          orderByValues.push(sql`${orderByUnit}`);
        }
      }
      orderBySql = sql` order by ${sql.join(orderByValues, sql`, `)} `;
    }
    const limitSql = typeof limit === "object" || typeof limit === "number" && limit >= 0 ? sql` limit ${limit}` : void 0;
    const operatorChunk = sql.raw(`${type} ${isAll ? "all " : ""}`);
    const offsetSql = offset ? sql` offset ${offset}` : void 0;
    return sql`${leftChunk}${operatorChunk}${rightChunk}${orderBySql}${limitSql}${offsetSql}`;
  }
  buildInsertQuery({ table, values: valuesOrSelect, ignore, onConflict, select }) {
    const valuesSqlList = [];
    const columns = table[Table.Symbol.Columns];
    const colEntries = Object.entries(columns).filter(
      ([_, col]) => !col.shouldDisableInsert()
    );
    const insertOrder = colEntries.map(([, column]) => sql.identifier(this.casing.getColumnCasing(column)));
    const generatedIdsResponse = [];
    if (select) {
      const select2 = valuesOrSelect;
      if (is(select2, SQL)) {
        valuesSqlList.push(select2);
      } else {
        valuesSqlList.push(select2.getSQL());
      }
    } else {
      const values = valuesOrSelect;
      valuesSqlList.push(sql.raw("values "));
      for (const [valueIndex, value] of values.entries()) {
        const generatedIds = {};
        const valueList = [];
        for (const [fieldName, col] of colEntries) {
          const colValue = value[fieldName];
          if (colValue === void 0 || is(colValue, Param) && colValue.value === void 0) {
            if (col.defaultFn !== void 0) {
              const defaultFnResult = col.defaultFn();
              generatedIds[fieldName] = defaultFnResult;
              const defaultValue = is(defaultFnResult, SQL) ? defaultFnResult : sql.param(defaultFnResult, col);
              valueList.push(defaultValue);
            } else if (!col.default && col.onUpdateFn !== void 0) {
              const onUpdateFnResult = col.onUpdateFn();
              const newValue = is(onUpdateFnResult, SQL) ? onUpdateFnResult : sql.param(onUpdateFnResult, col);
              valueList.push(newValue);
            } else {
              valueList.push(sql`default`);
            }
          } else {
            if (col.defaultFn && is(colValue, Param)) {
              generatedIds[fieldName] = colValue.value;
            }
            valueList.push(colValue);
          }
        }
        generatedIdsResponse.push(generatedIds);
        valuesSqlList.push(valueList);
        if (valueIndex < values.length - 1) {
          valuesSqlList.push(sql`, `);
        }
      }
    }
    const valuesSql = sql.join(valuesSqlList);
    const ignoreSql = ignore ? sql` ignore` : void 0;
    const onConflictSql = onConflict ? sql` on duplicate key ${onConflict}` : void 0;
    return {
      sql: sql`insert${ignoreSql} into ${table} ${insertOrder} ${valuesSql}${onConflictSql}`,
      generatedIds: generatedIdsResponse
    };
  }
  sqlToQuery(sql2, invokeSource) {
    return sql2.toQuery({
      casing: this.casing,
      escapeName: this.escapeName,
      escapeParam: this.escapeParam,
      escapeString: this.escapeString,
      invokeSource
    });
  }
  buildRelationalQuery({
    fullSchema,
    schema,
    tableNamesMap,
    table,
    tableConfig,
    queryConfig: config2,
    tableAlias,
    nestedQueryRelation,
    joinOn
  }) {
    let selection = [];
    let limit, offset, orderBy, where;
    const joins = [];
    if (config2 === true) {
      const selectionEntries = Object.entries(tableConfig.columns);
      selection = selectionEntries.map(([key, value]) => ({
        dbKey: value.name,
        tsKey: key,
        field: aliasedTableColumn(value, tableAlias),
        relationTableTsKey: void 0,
        isJson: false,
        selection: []
      }));
    } else {
      const aliasedColumns = Object.fromEntries(
        Object.entries(tableConfig.columns).map(([key, value]) => [key, aliasedTableColumn(value, tableAlias)])
      );
      if (config2.where) {
        const whereSql = typeof config2.where === "function" ? config2.where(aliasedColumns, getOperators()) : config2.where;
        where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
      }
      const fieldsSelection = [];
      let selectedColumns = [];
      if (config2.columns) {
        let isIncludeMode = false;
        for (const [field, value] of Object.entries(config2.columns)) {
          if (value === void 0) {
            continue;
          }
          if (field in tableConfig.columns) {
            if (!isIncludeMode && value === true) {
              isIncludeMode = true;
            }
            selectedColumns.push(field);
          }
        }
        if (selectedColumns.length > 0) {
          selectedColumns = isIncludeMode ? selectedColumns.filter((c) => config2.columns?.[c] === true) : Object.keys(tableConfig.columns).filter((key) => !selectedColumns.includes(key));
        }
      } else {
        selectedColumns = Object.keys(tableConfig.columns);
      }
      for (const field of selectedColumns) {
        const column = tableConfig.columns[field];
        fieldsSelection.push({ tsKey: field, value: column });
      }
      let selectedRelations = [];
      if (config2.with) {
        selectedRelations = Object.entries(config2.with).filter((entry) => !!entry[1]).map(([tsKey, queryConfig]) => ({ tsKey, queryConfig, relation: tableConfig.relations[tsKey] }));
      }
      let extras;
      if (config2.extras) {
        extras = typeof config2.extras === "function" ? config2.extras(aliasedColumns, { sql }) : config2.extras;
        for (const [tsKey, value] of Object.entries(extras)) {
          fieldsSelection.push({
            tsKey,
            value: mapColumnsInAliasedSQLToAlias(value, tableAlias)
          });
        }
      }
      for (const { tsKey, value } of fieldsSelection) {
        selection.push({
          dbKey: is(value, SQL.Aliased) ? value.fieldAlias : tableConfig.columns[tsKey].name,
          tsKey,
          field: is(value, Column) ? aliasedTableColumn(value, tableAlias) : value,
          relationTableTsKey: void 0,
          isJson: false,
          selection: []
        });
      }
      let orderByOrig = typeof config2.orderBy === "function" ? config2.orderBy(aliasedColumns, getOrderByOperators()) : config2.orderBy ?? [];
      if (!Array.isArray(orderByOrig)) {
        orderByOrig = [orderByOrig];
      }
      orderBy = orderByOrig.map((orderByValue) => {
        if (is(orderByValue, Column)) {
          return aliasedTableColumn(orderByValue, tableAlias);
        }
        return mapColumnsInSQLToAlias(orderByValue, tableAlias);
      });
      limit = config2.limit;
      offset = config2.offset;
      for (const {
        tsKey: selectedRelationTsKey,
        queryConfig: selectedRelationConfigValue,
        relation
      } of selectedRelations) {
        const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
        const relationTableName = getTableUniqueName(relation.referencedTable);
        const relationTableTsName = tableNamesMap[relationTableName];
        const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
        const joinOn2 = and(
          ...normalizedRelation.fields.map(
            (field2, i) => eq(
              aliasedTableColumn(normalizedRelation.references[i], relationTableAlias),
              aliasedTableColumn(field2, tableAlias)
            )
          )
        );
        const builtRelation = this.buildRelationalQuery({
          fullSchema,
          schema,
          tableNamesMap,
          table: fullSchema[relationTableTsName],
          tableConfig: schema[relationTableTsName],
          queryConfig: is(relation, One) ? selectedRelationConfigValue === true ? { limit: 1 } : { ...selectedRelationConfigValue, limit: 1 } : selectedRelationConfigValue,
          tableAlias: relationTableAlias,
          joinOn: joinOn2,
          nestedQueryRelation: relation
        });
        const field = sql`${sql.identifier(relationTableAlias)}.${sql.identifier("data")}`.as(selectedRelationTsKey);
        joins.push({
          on: sql`true`,
          table: new Subquery(builtRelation.sql, {}, relationTableAlias),
          alias: relationTableAlias,
          joinType: "left",
          lateral: true
        });
        selection.push({
          dbKey: selectedRelationTsKey,
          tsKey: selectedRelationTsKey,
          field,
          relationTableTsKey: relationTableTsName,
          isJson: true,
          selection: builtRelation.selection
        });
      }
    }
    if (selection.length === 0) {
      throw new DrizzleError({ message: `No fields selected for table "${tableConfig.tsName}" ("${tableAlias}")` });
    }
    let result;
    where = and(joinOn, where);
    if (nestedQueryRelation) {
      let field = sql`json_array(${sql.join(
        selection.map(
          ({ field: field2, tsKey, isJson }) => isJson ? sql`${sql.identifier(`${tableAlias}_${tsKey}`)}.${sql.identifier("data")}` : is(field2, SQL.Aliased) ? field2.sql : field2
        ),
        sql`, `
      )})`;
      if (is(nestedQueryRelation, Many)) {
        field = sql`coalesce(json_arrayagg(${field}), json_array())`;
      }
      const nestedSelection = [{
        dbKey: "data",
        tsKey: "data",
        field: field.as("data"),
        isJson: true,
        relationTableTsKey: tableConfig.tsName,
        selection
      }];
      const needsSubquery = limit !== void 0 || offset !== void 0 || (orderBy?.length ?? 0) > 0;
      if (needsSubquery) {
        result = this.buildSelectQuery({
          table: aliasedTable(table, tableAlias),
          fields: {},
          fieldsFlat: [
            {
              path: [],
              field: sql.raw("*")
            },
            ...(orderBy?.length ?? 0) > 0 ? [{
              path: [],
              field: sql`row_number() over (order by ${sql.join(orderBy, sql`, `)})`
            }] : []
          ],
          where,
          limit,
          offset,
          setOperators: []
        });
        where = void 0;
        limit = void 0;
        offset = void 0;
        orderBy = void 0;
      } else {
        result = aliasedTable(table, tableAlias);
      }
      result = this.buildSelectQuery({
        table: is(result, MySqlTable) ? result : new Subquery(result, {}, tableAlias),
        fields: {},
        fieldsFlat: nestedSelection.map(({ field: field2 }) => ({
          path: [],
          field: is(field2, Column) ? aliasedTableColumn(field2, tableAlias) : field2
        })),
        joins,
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      });
    } else {
      result = this.buildSelectQuery({
        table: aliasedTable(table, tableAlias),
        fields: {},
        fieldsFlat: selection.map(({ field }) => ({
          path: [],
          field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field
        })),
        joins,
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      });
    }
    return {
      tableTsKey: tableConfig.tsName,
      sql: result,
      selection
    };
  }
  buildRelationalQueryWithoutLateralSubqueries({
    fullSchema,
    schema,
    tableNamesMap,
    table,
    tableConfig,
    queryConfig: config2,
    tableAlias,
    nestedQueryRelation,
    joinOn
  }) {
    let selection = [];
    let limit, offset, orderBy = [], where;
    if (config2 === true) {
      const selectionEntries = Object.entries(tableConfig.columns);
      selection = selectionEntries.map(([key, value]) => ({
        dbKey: value.name,
        tsKey: key,
        field: aliasedTableColumn(value, tableAlias),
        relationTableTsKey: void 0,
        isJson: false,
        selection: []
      }));
    } else {
      const aliasedColumns = Object.fromEntries(
        Object.entries(tableConfig.columns).map(([key, value]) => [key, aliasedTableColumn(value, tableAlias)])
      );
      if (config2.where) {
        const whereSql = typeof config2.where === "function" ? config2.where(aliasedColumns, getOperators()) : config2.where;
        where = whereSql && mapColumnsInSQLToAlias(whereSql, tableAlias);
      }
      const fieldsSelection = [];
      let selectedColumns = [];
      if (config2.columns) {
        let isIncludeMode = false;
        for (const [field, value] of Object.entries(config2.columns)) {
          if (value === void 0) {
            continue;
          }
          if (field in tableConfig.columns) {
            if (!isIncludeMode && value === true) {
              isIncludeMode = true;
            }
            selectedColumns.push(field);
          }
        }
        if (selectedColumns.length > 0) {
          selectedColumns = isIncludeMode ? selectedColumns.filter((c) => config2.columns?.[c] === true) : Object.keys(tableConfig.columns).filter((key) => !selectedColumns.includes(key));
        }
      } else {
        selectedColumns = Object.keys(tableConfig.columns);
      }
      for (const field of selectedColumns) {
        const column = tableConfig.columns[field];
        fieldsSelection.push({ tsKey: field, value: column });
      }
      let selectedRelations = [];
      if (config2.with) {
        selectedRelations = Object.entries(config2.with).filter((entry) => !!entry[1]).map(([tsKey, queryConfig]) => ({ tsKey, queryConfig, relation: tableConfig.relations[tsKey] }));
      }
      let extras;
      if (config2.extras) {
        extras = typeof config2.extras === "function" ? config2.extras(aliasedColumns, { sql }) : config2.extras;
        for (const [tsKey, value] of Object.entries(extras)) {
          fieldsSelection.push({
            tsKey,
            value: mapColumnsInAliasedSQLToAlias(value, tableAlias)
          });
        }
      }
      for (const { tsKey, value } of fieldsSelection) {
        selection.push({
          dbKey: is(value, SQL.Aliased) ? value.fieldAlias : tableConfig.columns[tsKey].name,
          tsKey,
          field: is(value, Column) ? aliasedTableColumn(value, tableAlias) : value,
          relationTableTsKey: void 0,
          isJson: false,
          selection: []
        });
      }
      let orderByOrig = typeof config2.orderBy === "function" ? config2.orderBy(aliasedColumns, getOrderByOperators()) : config2.orderBy ?? [];
      if (!Array.isArray(orderByOrig)) {
        orderByOrig = [orderByOrig];
      }
      orderBy = orderByOrig.map((orderByValue) => {
        if (is(orderByValue, Column)) {
          return aliasedTableColumn(orderByValue, tableAlias);
        }
        return mapColumnsInSQLToAlias(orderByValue, tableAlias);
      });
      limit = config2.limit;
      offset = config2.offset;
      for (const {
        tsKey: selectedRelationTsKey,
        queryConfig: selectedRelationConfigValue,
        relation
      } of selectedRelations) {
        const normalizedRelation = normalizeRelation(schema, tableNamesMap, relation);
        const relationTableName = getTableUniqueName(relation.referencedTable);
        const relationTableTsName = tableNamesMap[relationTableName];
        const relationTableAlias = `${tableAlias}_${selectedRelationTsKey}`;
        const joinOn2 = and(
          ...normalizedRelation.fields.map(
            (field2, i) => eq(
              aliasedTableColumn(normalizedRelation.references[i], relationTableAlias),
              aliasedTableColumn(field2, tableAlias)
            )
          )
        );
        const builtRelation = this.buildRelationalQueryWithoutLateralSubqueries({
          fullSchema,
          schema,
          tableNamesMap,
          table: fullSchema[relationTableTsName],
          tableConfig: schema[relationTableTsName],
          queryConfig: is(relation, One) ? selectedRelationConfigValue === true ? { limit: 1 } : { ...selectedRelationConfigValue, limit: 1 } : selectedRelationConfigValue,
          tableAlias: relationTableAlias,
          joinOn: joinOn2,
          nestedQueryRelation: relation
        });
        let fieldSql = sql`(${builtRelation.sql})`;
        if (is(relation, Many)) {
          fieldSql = sql`coalesce(${fieldSql}, json_array())`;
        }
        const field = fieldSql.as(selectedRelationTsKey);
        selection.push({
          dbKey: selectedRelationTsKey,
          tsKey: selectedRelationTsKey,
          field,
          relationTableTsKey: relationTableTsName,
          isJson: true,
          selection: builtRelation.selection
        });
      }
    }
    if (selection.length === 0) {
      throw new DrizzleError({
        message: `No fields selected for table "${tableConfig.tsName}" ("${tableAlias}"). You need to have at least one item in "columns", "with" or "extras". If you need to select all columns, omit the "columns" key or set it to undefined.`
      });
    }
    let result;
    where = and(joinOn, where);
    if (nestedQueryRelation) {
      let field = sql`json_array(${sql.join(
        selection.map(
          ({ field: field2 }) => is(field2, MySqlColumn) ? sql.identifier(this.casing.getColumnCasing(field2)) : is(field2, SQL.Aliased) ? field2.sql : field2
        ),
        sql`, `
      )})`;
      if (is(nestedQueryRelation, Many)) {
        field = sql`json_arrayagg(${field})`;
      }
      const nestedSelection = [{
        dbKey: "data",
        tsKey: "data",
        field,
        isJson: true,
        relationTableTsKey: tableConfig.tsName,
        selection
      }];
      const needsSubquery = limit !== void 0 || offset !== void 0 || orderBy.length > 0;
      if (needsSubquery) {
        result = this.buildSelectQuery({
          table: aliasedTable(table, tableAlias),
          fields: {},
          fieldsFlat: [
            {
              path: [],
              field: sql.raw("*")
            },
            ...orderBy.length > 0 ? [{
              path: [],
              field: sql`row_number() over (order by ${sql.join(orderBy, sql`, `)})`
            }] : []
          ],
          where,
          limit,
          offset,
          setOperators: []
        });
        where = void 0;
        limit = void 0;
        offset = void 0;
        orderBy = void 0;
      } else {
        result = aliasedTable(table, tableAlias);
      }
      result = this.buildSelectQuery({
        table: is(result, MySqlTable) ? result : new Subquery(result, {}, tableAlias),
        fields: {},
        fieldsFlat: nestedSelection.map(({ field: field2 }) => ({
          path: [],
          field: is(field2, Column) ? aliasedTableColumn(field2, tableAlias) : field2
        })),
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      });
    } else {
      result = this.buildSelectQuery({
        table: aliasedTable(table, tableAlias),
        fields: {},
        fieldsFlat: selection.map(({ field }) => ({
          path: [],
          field: is(field, Column) ? aliasedTableColumn(field, tableAlias) : field
        })),
        where,
        limit,
        offset,
        orderBy,
        setOperators: []
      });
    }
    return {
      tableTsKey: tableConfig.tsName,
      sql: result,
      selection
    };
  }
};

// node_modules/drizzle-orm/query-builders/query-builder.js
var TypedQueryBuilder = class {
  static [entityKind] = "TypedQueryBuilder";
  /** @internal */
  getSelectedFields() {
    return this._.selectedFields;
  }
};

// node_modules/drizzle-orm/mysql-core/utils.js
function convertIndexToString(indexes) {
  return indexes.map((idx) => {
    return typeof idx === "object" ? idx.config.name : idx;
  });
}
function toArray(value) {
  return Array.isArray(value) ? value : [value];
}

// node_modules/drizzle-orm/mysql-core/query-builders/select.js
var MySqlSelectBuilder = class {
  static [entityKind] = "MySqlSelectBuilder";
  fields;
  session;
  dialect;
  withList = [];
  distinct;
  constructor(config2) {
    this.fields = config2.fields;
    this.session = config2.session;
    this.dialect = config2.dialect;
    if (config2.withList) {
      this.withList = config2.withList;
    }
    this.distinct = config2.distinct;
  }
  from(source, onIndex) {
    const isPartialSelect = !!this.fields;
    let fields;
    if (this.fields) {
      fields = this.fields;
    } else if (is(source, Subquery)) {
      fields = Object.fromEntries(
        Object.keys(source._.selectedFields).map((key) => [key, source[key]])
      );
    } else if (is(source, MySqlViewBase)) {
      fields = source[ViewBaseConfig].selectedFields;
    } else if (is(source, SQL)) {
      fields = {};
    } else {
      fields = getTableColumns(source);
    }
    let useIndex = [];
    let forceIndex = [];
    let ignoreIndex = [];
    if (is(source, MySqlTable) && onIndex && typeof onIndex !== "string") {
      if (onIndex.useIndex) {
        useIndex = convertIndexToString(toArray(onIndex.useIndex));
      }
      if (onIndex.forceIndex) {
        forceIndex = convertIndexToString(toArray(onIndex.forceIndex));
      }
      if (onIndex.ignoreIndex) {
        ignoreIndex = convertIndexToString(toArray(onIndex.ignoreIndex));
      }
    }
    return new MySqlSelectBase(
      {
        table: source,
        fields,
        isPartialSelect,
        session: this.session,
        dialect: this.dialect,
        withList: this.withList,
        distinct: this.distinct,
        useIndex,
        forceIndex,
        ignoreIndex
      }
    );
  }
};
var MySqlSelectQueryBuilderBase = class extends TypedQueryBuilder {
  static [entityKind] = "MySqlSelectQueryBuilder";
  _;
  config;
  joinsNotNullableMap;
  tableName;
  isPartialSelect;
  /** @internal */
  session;
  dialect;
  constructor({ table, fields, isPartialSelect, session, dialect, withList, distinct, useIndex, forceIndex, ignoreIndex }) {
    super();
    this.config = {
      withList,
      table,
      fields: { ...fields },
      distinct,
      setOperators: [],
      useIndex,
      forceIndex,
      ignoreIndex
    };
    this.isPartialSelect = isPartialSelect;
    this.session = session;
    this.dialect = dialect;
    this._ = {
      selectedFields: fields
    };
    this.tableName = getTableLikeName(table);
    this.joinsNotNullableMap = typeof this.tableName === "string" ? { [this.tableName]: true } : {};
  }
  createJoin(joinType) {
    return (table, on, onIndex) => {
      const baseTableName = this.tableName;
      const tableName = getTableLikeName(table);
      if (typeof tableName === "string" && this.config.joins?.some((join) => join.alias === tableName)) {
        throw new Error(`Alias "${tableName}" is already used in this query`);
      }
      if (!this.isPartialSelect) {
        if (Object.keys(this.joinsNotNullableMap).length === 1 && typeof baseTableName === "string") {
          this.config.fields = {
            [baseTableName]: this.config.fields
          };
        }
        if (typeof tableName === "string" && !is(table, SQL)) {
          const selection = is(table, Subquery) ? table._.selectedFields : is(table, View) ? table[ViewBaseConfig].selectedFields : table[Table.Symbol.Columns];
          this.config.fields[tableName] = selection;
        }
      }
      if (typeof on === "function") {
        on = on(
          new Proxy(
            this.config.fields,
            new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
          )
        );
      }
      if (!this.config.joins) {
        this.config.joins = [];
      }
      let useIndex = [];
      let forceIndex = [];
      let ignoreIndex = [];
      if (is(table, MySqlTable) && onIndex && typeof onIndex !== "string") {
        if (onIndex.useIndex) {
          useIndex = convertIndexToString(toArray(onIndex.useIndex));
        }
        if (onIndex.forceIndex) {
          forceIndex = convertIndexToString(toArray(onIndex.forceIndex));
        }
        if (onIndex.ignoreIndex) {
          ignoreIndex = convertIndexToString(toArray(onIndex.ignoreIndex));
        }
      }
      this.config.joins.push({ on, table, joinType, alias: tableName, useIndex, forceIndex, ignoreIndex });
      if (typeof tableName === "string") {
        switch (joinType) {
          case "left": {
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
          case "right": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "inner": {
            this.joinsNotNullableMap[tableName] = true;
            break;
          }
          case "full": {
            this.joinsNotNullableMap = Object.fromEntries(
              Object.entries(this.joinsNotNullableMap).map(([key]) => [key, false])
            );
            this.joinsNotNullableMap[tableName] = false;
            break;
          }
        }
      }
      return this;
    };
  }
  /**
   * Executes a `left join` operation by adding another table to the current query.
   *
   * Calling this method associates each row of the table with the corresponding row from the joined table, if a match is found. If no matching row exists, it sets all columns of the joined table to null.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#left-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User; pets: Pet | null }[] = await db.select()
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number; petId: number | null }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId with use index hint
   * const usersIdsAndPetIds: { userId: number; petId: number | null }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId), {
   *     useIndex: ['pets_owner_id_index']
   * })
   * ```
   */
  leftJoin = this.createJoin("left");
  /**
   * Executes a `right join` operation by adding another table to the current query.
   *
   * Calling this method associates each row of the joined table with the corresponding row from the main table, if a match is found. If no matching row exists, it sets all columns of the main table to null.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#right-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User | null; pets: Pet }[] = await db.select()
   *   .from(users)
   *   .rightJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number | null; petId: number }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .rightJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId with use index hint
   * const usersIdsAndPetIds: { userId: number; petId: number | null }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId), {
   *     useIndex: ['pets_owner_id_index']
   * })
   * ```
   */
  rightJoin = this.createJoin("right");
  /**
   * Executes an `inner join` operation, creating a new table by combining rows from two tables that have matching values.
   *
   * Calling this method retrieves rows that have corresponding entries in both joined tables. Rows without matching entries in either table are excluded, resulting in a table that includes only matching pairs.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#inner-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User; pets: Pet }[] = await db.select()
   *   .from(users)
   *   .innerJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number; petId: number }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .innerJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId with use index hint
   * const usersIdsAndPetIds: { userId: number; petId: number | null }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId), {
   *     useIndex: ['pets_owner_id_index']
   * })
   * ```
   */
  innerJoin = this.createJoin("inner");
  /**
   * Executes a `full join` operation by combining rows from two tables into a new table.
   *
   * Calling this method retrieves all rows from both main and joined tables, merging rows with matching values and filling in `null` for non-matching columns.
   *
   * See docs: {@link https://orm.drizzle.team/docs/joins#full-join}
   *
   * @param table the table to join.
   * @param on the `on` clause.
   *
   * @example
   *
   * ```ts
   * // Select all users and their pets
   * const usersWithPets: { user: User | null; pets: Pet | null }[] = await db.select()
   *   .from(users)
   *   .fullJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId
   * const usersIdsAndPetIds: { userId: number | null; petId: number | null }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .fullJoin(pets, eq(users.id, pets.ownerId))
   *
   * // Select userId and petId with use index hint
   * const usersIdsAndPetIds: { userId: number; petId: number | null }[] = await db.select({
   *   userId: users.id,
   *   petId: pets.id,
   * })
   *   .from(users)
   *   .leftJoin(pets, eq(users.id, pets.ownerId), {
   *     useIndex: ['pets_owner_id_index']
   * })
   * ```
   */
  fullJoin = this.createJoin("full");
  createSetOperator(type, isAll) {
    return (rightSelection) => {
      const rightSelect = typeof rightSelection === "function" ? rightSelection(getMySqlSetOperators()) : rightSelection;
      if (!haveSameKeys(this.getSelectedFields(), rightSelect.getSelectedFields())) {
        throw new Error(
          "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
        );
      }
      this.config.setOperators.push({ type, isAll, rightSelect });
      return this;
    };
  }
  /**
   * Adds `union` set operator to the query.
   *
   * Calling this method will combine the result sets of the `select` statements and remove any duplicate rows that appear across them.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#union}
   *
   * @example
   *
   * ```ts
   * // Select all unique names from customers and users tables
   * await db.select({ name: users.name })
   *   .from(users)
   *   .union(
   *     db.select({ name: customers.name }).from(customers)
   *   );
   * // or
   * import { union } from 'drizzle-orm/mysql-core'
   *
   * await union(
   *   db.select({ name: users.name }).from(users),
   *   db.select({ name: customers.name }).from(customers)
   * );
   * ```
   */
  union = this.createSetOperator("union", false);
  /**
   * Adds `union all` set operator to the query.
   *
   * Calling this method will combine the result-set of the `select` statements and keep all duplicate rows that appear across them.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#union-all}
   *
   * @example
   *
   * ```ts
   * // Select all transaction ids from both online and in-store sales
   * await db.select({ transaction: onlineSales.transactionId })
   *   .from(onlineSales)
   *   .unionAll(
   *     db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
   *   );
   * // or
   * import { unionAll } from 'drizzle-orm/mysql-core'
   *
   * await unionAll(
   *   db.select({ transaction: onlineSales.transactionId }).from(onlineSales),
   *   db.select({ transaction: inStoreSales.transactionId }).from(inStoreSales)
   * );
   * ```
   */
  unionAll = this.createSetOperator("union", true);
  /**
   * Adds `intersect` set operator to the query.
   *
   * Calling this method will retain only the rows that are present in both result sets and eliminate duplicates.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#intersect}
   *
   * @example
   *
   * ```ts
   * // Select course names that are offered in both departments A and B
   * await db.select({ courseName: depA.courseName })
   *   .from(depA)
   *   .intersect(
   *     db.select({ courseName: depB.courseName }).from(depB)
   *   );
   * // or
   * import { intersect } from 'drizzle-orm/mysql-core'
   *
   * await intersect(
   *   db.select({ courseName: depA.courseName }).from(depA),
   *   db.select({ courseName: depB.courseName }).from(depB)
   * );
   * ```
   */
  intersect = this.createSetOperator("intersect", false);
  /**
   * Adds `intersect all` set operator to the query.
   *
   * Calling this method will retain only the rows that are present in both result sets including all duplicates.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#intersect-all}
   *
   * @example
   *
   * ```ts
   * // Select all products and quantities that are ordered by both regular and VIP customers
   * await db.select({
   *   productId: regularCustomerOrders.productId,
   *   quantityOrdered: regularCustomerOrders.quantityOrdered
   * })
   * .from(regularCustomerOrders)
   * .intersectAll(
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered
   *   })
   *   .from(vipCustomerOrders)
   * );
   * // or
   * import { intersectAll } from 'drizzle-orm/mysql-core'
   *
   * await intersectAll(
   *   db.select({
   *     productId: regularCustomerOrders.productId,
   *     quantityOrdered: regularCustomerOrders.quantityOrdered
   *   })
   *   .from(regularCustomerOrders),
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered
   *   })
   *   .from(vipCustomerOrders)
   * );
   * ```
   */
  intersectAll = this.createSetOperator("intersect", true);
  /**
   * Adds `except` set operator to the query.
   *
   * Calling this method will retrieve all unique rows from the left query, except for the rows that are present in the result set of the right query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#except}
   *
   * @example
   *
   * ```ts
   * // Select all courses offered in department A but not in department B
   * await db.select({ courseName: depA.courseName })
   *   .from(depA)
   *   .except(
   *     db.select({ courseName: depB.courseName }).from(depB)
   *   );
   * // or
   * import { except } from 'drizzle-orm/mysql-core'
   *
   * await except(
   *   db.select({ courseName: depA.courseName }).from(depA),
   *   db.select({ courseName: depB.courseName }).from(depB)
   * );
   * ```
   */
  except = this.createSetOperator("except", false);
  /**
   * Adds `except all` set operator to the query.
   *
   * Calling this method will retrieve all rows from the left query, except for the rows that are present in the result set of the right query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/set-operations#except-all}
   *
   * @example
   *
   * ```ts
   * // Select all products that are ordered by regular customers but not by VIP customers
   * await db.select({
   *   productId: regularCustomerOrders.productId,
   *   quantityOrdered: regularCustomerOrders.quantityOrdered,
   * })
   * .from(regularCustomerOrders)
   * .exceptAll(
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered,
   *   })
   *   .from(vipCustomerOrders)
   * );
   * // or
   * import { exceptAll } from 'drizzle-orm/mysql-core'
   *
   * await exceptAll(
   *   db.select({
   *     productId: regularCustomerOrders.productId,
   *     quantityOrdered: regularCustomerOrders.quantityOrdered
   *   })
   *   .from(regularCustomerOrders),
   *   db.select({
   *     productId: vipCustomerOrders.productId,
   *     quantityOrdered: vipCustomerOrders.quantityOrdered
   *   })
   *   .from(vipCustomerOrders)
   * );
   * ```
   */
  exceptAll = this.createSetOperator("except", true);
  /** @internal */
  addSetOperators(setOperators) {
    this.config.setOperators.push(...setOperators);
    return this;
  }
  /**
   * Adds a `where` clause to the query.
   *
   * Calling this method will select only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#filtering}
   *
   * @param where the `where` clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be selected.
   *
   * ```ts
   * // Select all cars with green color
   * await db.select().from(cars).where(eq(cars.color, 'green'));
   * // or
   * await db.select().from(cars).where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Select all BMW cars with a green color
   * await db.select().from(cars).where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Select all cars with the green or blue color
   * await db.select().from(cars).where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    if (typeof where === "function") {
      where = where(
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
        )
      );
    }
    this.config.where = where;
    return this;
  }
  /**
   * Adds a `having` clause to the query.
   *
   * Calling this method will select only those rows that fulfill a specified condition. It is typically used with aggregate functions to filter the aggregated data based on a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#aggregations}
   *
   * @param having the `having` clause.
   *
   * @example
   *
   * ```ts
   * // Select all brands with more than one car
   * await db.select({
   * 	brand: cars.brand,
   * 	count: sql<number>`cast(count(${cars.id}) as int)`,
   * })
   *   .from(cars)
   *   .groupBy(cars.brand)
   *   .having(({ count }) => gt(count, 1));
   * ```
   */
  having(having) {
    if (typeof having === "function") {
      having = having(
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "sql", sqlBehavior: "sql" })
        )
      );
    }
    this.config.having = having;
    return this;
  }
  groupBy(...columns) {
    if (typeof columns[0] === "function") {
      const groupBy = columns[0](
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      this.config.groupBy = Array.isArray(groupBy) ? groupBy : [groupBy];
    } else {
      this.config.groupBy = columns;
    }
    return this;
  }
  orderBy(...columns) {
    if (typeof columns[0] === "function") {
      const orderBy = columns[0](
        new Proxy(
          this.config.fields,
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
      if (this.config.setOperators.length > 0) {
        this.config.setOperators.at(-1).orderBy = orderByArray;
      } else {
        this.config.orderBy = orderByArray;
      }
    } else {
      const orderByArray = columns;
      if (this.config.setOperators.length > 0) {
        this.config.setOperators.at(-1).orderBy = orderByArray;
      } else {
        this.config.orderBy = orderByArray;
      }
    }
    return this;
  }
  /**
   * Adds a `limit` clause to the query.
   *
   * Calling this method will set the maximum number of rows that will be returned by this query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
   *
   * @param limit the `limit` clause.
   *
   * @example
   *
   * ```ts
   * // Get the first 10 people from this query.
   * await db.select().from(people).limit(10);
   * ```
   */
  limit(limit) {
    if (this.config.setOperators.length > 0) {
      this.config.setOperators.at(-1).limit = limit;
    } else {
      this.config.limit = limit;
    }
    return this;
  }
  /**
   * Adds an `offset` clause to the query.
   *
   * Calling this method will skip a number of rows when returning results from this query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#limit--offset}
   *
   * @param offset the `offset` clause.
   *
   * @example
   *
   * ```ts
   * // Get the 10th-20th people from this query.
   * await db.select().from(people).offset(10).limit(10);
   * ```
   */
  offset(offset) {
    if (this.config.setOperators.length > 0) {
      this.config.setOperators.at(-1).offset = offset;
    } else {
      this.config.offset = offset;
    }
    return this;
  }
  /**
   * Adds a `for` clause to the query.
   *
   * Calling this method will specify a lock strength for this query that controls how strictly it acquires exclusive access to the rows being queried.
   *
   * See docs: {@link https://dev.mysql.com/doc/refman/8.0/en/innodb-locking-reads.html}
   *
   * @param strength the lock strength.
   * @param config the lock configuration.
   */
  for(strength, config2 = {}) {
    this.config.lockingClause = { strength, config: config2 };
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildSelectQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  as(alias) {
    return new Proxy(
      new Subquery(this.getSQL(), this.config.fields, alias),
      new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
    );
  }
  /** @internal */
  getSelectedFields() {
    return new Proxy(
      this.config.fields,
      new SelectionProxyHandler({ alias: this.tableName, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
    );
  }
  $dynamic() {
    return this;
  }
};
var MySqlSelectBase = class extends MySqlSelectQueryBuilderBase {
  static [entityKind] = "MySqlSelect";
  prepare() {
    if (!this.session) {
      throw new Error("Cannot execute a query on a query builder. Please use a database instance instead.");
    }
    const fieldsList = orderSelectedFields(this.config.fields);
    const query = this.session.prepareQuery(this.dialect.sqlToQuery(this.getSQL()), fieldsList);
    query.joinsNotNullableMap = this.joinsNotNullableMap;
    return query;
  }
  execute = (placeholderValues) => {
    return this.prepare().execute(placeholderValues);
  };
  createIterator = () => {
    const self = this;
    return async function* (placeholderValues) {
      yield* self.prepare().iterator(placeholderValues);
    };
  };
  iterator = this.createIterator();
};
applyMixins(MySqlSelectBase, [QueryPromise]);
function createSetOperator(type, isAll) {
  return (leftSelect, rightSelect, ...restSelects) => {
    const setOperators = [rightSelect, ...restSelects].map((select) => ({
      type,
      isAll,
      rightSelect: select
    }));
    for (const setOperator of setOperators) {
      if (!haveSameKeys(leftSelect.getSelectedFields(), setOperator.rightSelect.getSelectedFields())) {
        throw new Error(
          "Set operator error (union / intersect / except): selected fields are not the same or are in a different order"
        );
      }
    }
    return leftSelect.addSetOperators(setOperators);
  };
}
var getMySqlSetOperators = () => ({
  union,
  unionAll,
  intersect,
  intersectAll,
  except,
  exceptAll
});
var union = createSetOperator("union", false);
var unionAll = createSetOperator("union", true);
var intersect = createSetOperator("intersect", false);
var intersectAll = createSetOperator("intersect", true);
var except = createSetOperator("except", false);
var exceptAll = createSetOperator("except", true);

// node_modules/drizzle-orm/mysql-core/query-builders/query-builder.js
var QueryBuilder = class {
  static [entityKind] = "MySqlQueryBuilder";
  dialect;
  dialectConfig;
  constructor(dialect) {
    this.dialect = is(dialect, MySqlDialect) ? dialect : void 0;
    this.dialectConfig = is(dialect, MySqlDialect) ? void 0 : dialect;
  }
  $with = (alias, selection) => {
    const queryBuilder = this;
    const as = (qb) => {
      if (typeof qb === "function") {
        qb = qb(queryBuilder);
      }
      return new Proxy(
        new WithSubquery(
          qb.getSQL(),
          selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}),
          alias,
          true
        ),
        new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
      );
    };
    return { as };
  };
  with(...queries) {
    const self = this;
    function select(fields) {
      return new MySqlSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self.getDialect(),
        withList: queries
      });
    }
    function selectDistinct(fields) {
      return new MySqlSelectBuilder({
        fields: fields ?? void 0,
        session: void 0,
        dialect: self.getDialect(),
        withList: queries,
        distinct: true
      });
    }
    return { select, selectDistinct };
  }
  select(fields) {
    return new MySqlSelectBuilder({ fields: fields ?? void 0, session: void 0, dialect: this.getDialect() });
  }
  selectDistinct(fields) {
    return new MySqlSelectBuilder({
      fields: fields ?? void 0,
      session: void 0,
      dialect: this.getDialect(),
      distinct: true
    });
  }
  // Lazy load dialect to avoid circular dependency
  getDialect() {
    if (!this.dialect) {
      this.dialect = new MySqlDialect(this.dialectConfig);
    }
    return this.dialect;
  }
};

// node_modules/drizzle-orm/mysql-core/query-builders/insert.js
var MySqlInsertBuilder = class {
  constructor(table, session, dialect) {
    this.table = table;
    this.session = session;
    this.dialect = dialect;
  }
  static [entityKind] = "MySqlInsertBuilder";
  shouldIgnore = false;
  ignore() {
    this.shouldIgnore = true;
    return this;
  }
  values(values) {
    values = Array.isArray(values) ? values : [values];
    if (values.length === 0) {
      throw new Error("values() must be called with at least one value");
    }
    const mappedValues = values.map((entry) => {
      const result = {};
      const cols = this.table[Table.Symbol.Columns];
      for (const colKey of Object.keys(entry)) {
        const colValue = entry[colKey];
        result[colKey] = is(colValue, SQL) ? colValue : new Param(colValue, cols[colKey]);
      }
      return result;
    });
    return new MySqlInsertBase(this.table, mappedValues, this.shouldIgnore, this.session, this.dialect);
  }
  select(selectQuery) {
    const select = typeof selectQuery === "function" ? selectQuery(new QueryBuilder()) : selectQuery;
    if (!is(select, SQL) && !haveSameKeys(this.table[Columns], select._.selectedFields)) {
      throw new Error(
        "Insert select error: selected fields are not the same or are in a different order compared to the table definition"
      );
    }
    return new MySqlInsertBase(this.table, select, this.shouldIgnore, this.session, this.dialect, true);
  }
};
var MySqlInsertBase = class extends QueryPromise {
  constructor(table, values, ignore, session, dialect, select) {
    super();
    this.session = session;
    this.dialect = dialect;
    this.config = { table, values, select, ignore };
  }
  static [entityKind] = "MySqlInsert";
  config;
  /**
   * Adds an `on duplicate key update` clause to the query.
   *
   * Calling this method will update the row if any unique index conflicts. MySQL will automatically determine the conflict target based on the primary key and unique indexes.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert#on-duplicate-key-update}
   *
   * @param config The `set` clause
   *
   * @example
   * ```ts
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW'})
   *   .onDuplicateKeyUpdate({ set: { brand: 'Porsche' }});
   * ```
   *
   * While MySQL does not directly support doing nothing on conflict, you can perform a no-op by setting any column's value to itself and achieve the same effect:
   *
   * ```ts
   * import { sql } from 'drizzle-orm';
   *
   * await db.insert(cars)
   *   .values({ id: 1, brand: 'BMW' })
   *   .onDuplicateKeyUpdate({ set: { id: sql`id` } });
   * ```
   */
  onDuplicateKeyUpdate(config2) {
    const setSql = this.dialect.buildUpdateSet(this.config.table, mapUpdateSet(this.config.table, config2.set));
    this.config.onConflict = sql`update ${setSql}`;
    return this;
  }
  $returningId() {
    const returning = [];
    for (const [key, value] of Object.entries(this.config.table[Table.Symbol.Columns])) {
      if (value.primary) {
        returning.push({ field: value, path: [key] });
      }
    }
    this.config.returning = returning;
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildInsertQuery(this.config).sql;
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  prepare() {
    const { sql: sql2, generatedIds } = this.dialect.buildInsertQuery(this.config);
    return this.session.prepareQuery(
      this.dialect.sqlToQuery(sql2),
      void 0,
      void 0,
      generatedIds,
      this.config.returning
    );
  }
  execute = (placeholderValues) => {
    return this.prepare().execute(placeholderValues);
  };
  createIterator = () => {
    const self = this;
    return async function* (placeholderValues) {
      yield* self.prepare().iterator(placeholderValues);
    };
  };
  iterator = this.createIterator();
  $dynamic() {
    return this;
  }
};

// node_modules/drizzle-orm/mysql-core/query-builders/update.js
var MySqlUpdateBuilder = class {
  constructor(table, session, dialect, withList) {
    this.table = table;
    this.session = session;
    this.dialect = dialect;
    this.withList = withList;
  }
  static [entityKind] = "MySqlUpdateBuilder";
  set(values) {
    return new MySqlUpdateBase(this.table, mapUpdateSet(this.table, values), this.session, this.dialect, this.withList);
  }
};
var MySqlUpdateBase = class extends QueryPromise {
  constructor(table, set, session, dialect, withList) {
    super();
    this.session = session;
    this.dialect = dialect;
    this.config = { set, table, withList };
  }
  static [entityKind] = "MySqlUpdate";
  config;
  /**
   * Adds a 'where' clause to the query.
   *
   * Calling this method will update only those rows that fulfill a specified condition.
   *
   * See docs: {@link https://orm.drizzle.team/docs/update}
   *
   * @param where the 'where' clause.
   *
   * @example
   * You can use conditional operators and `sql function` to filter the rows to be updated.
   *
   * ```ts
   * // Update all cars with green color
   * db.update(cars).set({ color: 'red' })
   *   .where(eq(cars.color, 'green'));
   * // or
   * db.update(cars).set({ color: 'red' })
   *   .where(sql`${cars.color} = 'green'`)
   * ```
   *
   * You can logically combine conditional operators with `and()` and `or()` operators:
   *
   * ```ts
   * // Update all BMW cars with a green color
   * db.update(cars).set({ color: 'red' })
   *   .where(and(eq(cars.color, 'green'), eq(cars.brand, 'BMW')));
   *
   * // Update all cars with the green or blue color
   * db.update(cars).set({ color: 'red' })
   *   .where(or(eq(cars.color, 'green'), eq(cars.color, 'blue')));
   * ```
   */
  where(where) {
    this.config.where = where;
    return this;
  }
  orderBy(...columns) {
    if (typeof columns[0] === "function") {
      const orderBy = columns[0](
        new Proxy(
          this.config.table[Table.Symbol.Columns],
          new SelectionProxyHandler({ sqlAliasedBehavior: "alias", sqlBehavior: "sql" })
        )
      );
      const orderByArray = Array.isArray(orderBy) ? orderBy : [orderBy];
      this.config.orderBy = orderByArray;
    } else {
      const orderByArray = columns;
      this.config.orderBy = orderByArray;
    }
    return this;
  }
  limit(limit) {
    this.config.limit = limit;
    return this;
  }
  /** @internal */
  getSQL() {
    return this.dialect.buildUpdateQuery(this.config);
  }
  toSQL() {
    const { typings: _typings, ...rest } = this.dialect.sqlToQuery(this.getSQL());
    return rest;
  }
  prepare() {
    return this.session.prepareQuery(
      this.dialect.sqlToQuery(this.getSQL()),
      this.config.returning
    );
  }
  execute = (placeholderValues) => {
    return this.prepare().execute(placeholderValues);
  };
  createIterator = () => {
    const self = this;
    return async function* (placeholderValues) {
      yield* self.prepare().iterator(placeholderValues);
    };
  };
  iterator = this.createIterator();
  $dynamic() {
    return this;
  }
};

// node_modules/drizzle-orm/mysql-core/query-builders/query.js
var RelationalQueryBuilder = class {
  constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session, mode) {
    this.fullSchema = fullSchema;
    this.schema = schema;
    this.tableNamesMap = tableNamesMap;
    this.table = table;
    this.tableConfig = tableConfig;
    this.dialect = dialect;
    this.session = session;
    this.mode = mode;
  }
  static [entityKind] = "MySqlRelationalQueryBuilder";
  findMany(config2) {
    return new MySqlRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config2 ? config2 : {},
      "many",
      this.mode
    );
  }
  findFirst(config2) {
    return new MySqlRelationalQuery(
      this.fullSchema,
      this.schema,
      this.tableNamesMap,
      this.table,
      this.tableConfig,
      this.dialect,
      this.session,
      config2 ? { ...config2, limit: 1 } : { limit: 1 },
      "first",
      this.mode
    );
  }
};
var MySqlRelationalQuery = class extends QueryPromise {
  constructor(fullSchema, schema, tableNamesMap, table, tableConfig, dialect, session, config2, queryMode, mode) {
    super();
    this.fullSchema = fullSchema;
    this.schema = schema;
    this.tableNamesMap = tableNamesMap;
    this.table = table;
    this.tableConfig = tableConfig;
    this.dialect = dialect;
    this.session = session;
    this.config = config2;
    this.queryMode = queryMode;
    this.mode = mode;
  }
  static [entityKind] = "MySqlRelationalQuery";
  prepare() {
    const { query, builtQuery } = this._toSQL();
    return this.session.prepareQuery(
      builtQuery,
      void 0,
      (rawRows) => {
        const rows = rawRows.map((row) => mapRelationalRow(this.schema, this.tableConfig, row, query.selection));
        if (this.queryMode === "first") {
          return rows[0];
        }
        return rows;
      }
    );
  }
  _getQuery() {
    const query = this.mode === "planetscale" ? this.dialect.buildRelationalQueryWithoutLateralSubqueries({
      fullSchema: this.fullSchema,
      schema: this.schema,
      tableNamesMap: this.tableNamesMap,
      table: this.table,
      tableConfig: this.tableConfig,
      queryConfig: this.config,
      tableAlias: this.tableConfig.tsName
    }) : this.dialect.buildRelationalQuery({
      fullSchema: this.fullSchema,
      schema: this.schema,
      tableNamesMap: this.tableNamesMap,
      table: this.table,
      tableConfig: this.tableConfig,
      queryConfig: this.config,
      tableAlias: this.tableConfig.tsName
    });
    return query;
  }
  _toSQL() {
    const query = this._getQuery();
    const builtQuery = this.dialect.sqlToQuery(query.sql);
    return { builtQuery, query };
  }
  /** @internal */
  getSQL() {
    return this._getQuery().sql;
  }
  toSQL() {
    return this._toSQL().builtQuery;
  }
  execute() {
    return this.prepare().execute();
  }
};

// node_modules/drizzle-orm/mysql-core/db.js
var MySqlDatabase = class {
  constructor(dialect, session, schema, mode) {
    this.dialect = dialect;
    this.session = session;
    this.mode = mode;
    this._ = schema ? {
      schema: schema.schema,
      fullSchema: schema.fullSchema,
      tableNamesMap: schema.tableNamesMap
    } : {
      schema: void 0,
      fullSchema: {},
      tableNamesMap: {}
    };
    this.query = {};
    if (this._.schema) {
      for (const [tableName, columns] of Object.entries(this._.schema)) {
        this.query[tableName] = new RelationalQueryBuilder(
          schema.fullSchema,
          this._.schema,
          this._.tableNamesMap,
          schema.fullSchema[tableName],
          columns,
          dialect,
          session,
          this.mode
        );
      }
    }
  }
  static [entityKind] = "MySqlDatabase";
  query;
  /**
   * Creates a subquery that defines a temporary named result set as a CTE.
   *
   * It is useful for breaking down complex queries into simpler parts and for reusing the result set in subsequent parts of the query.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
   *
   * @param alias The alias for the subquery.
   *
   * Failure to provide an alias will result in a DrizzleTypeError, preventing the subquery from being referenced in other queries.
   *
   * @example
   *
   * ```ts
   * // Create a subquery with alias 'sq' and use it in the select query
   * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
   *
   * const result = await db.with(sq).select().from(sq);
   * ```
   *
   * To select arbitrary SQL values as fields in a CTE and reference them in other CTEs or in the main query, you need to add aliases to them:
   *
   * ```ts
   * // Select an arbitrary SQL value as a field in a CTE and reference it in the main query
   * const sq = db.$with('sq').as(db.select({
   *   name: sql<string>`upper(${users.name})`.as('name'),
   * })
   * .from(users));
   *
   * const result = await db.with(sq).select({ name: sq.name }).from(sq);
   * ```
   */
  $with = (alias, selection) => {
    const self = this;
    const as = (qb) => {
      if (typeof qb === "function") {
        qb = qb(new QueryBuilder(self.dialect));
      }
      return new Proxy(
        new WithSubquery(
          qb.getSQL(),
          selection ?? ("getSelectedFields" in qb ? qb.getSelectedFields() ?? {} : {}),
          alias,
          true
        ),
        new SelectionProxyHandler({ alias, sqlAliasedBehavior: "alias", sqlBehavior: "error" })
      );
    };
    return { as };
  };
  $count(source, filters) {
    return new MySqlCountBuilder({ source, filters, session: this.session });
  }
  /**
   * Incorporates a previously defined CTE (using `$with`) into the main query.
   *
   * This method allows the main query to reference a temporary named result set.
   *
   * See docs: {@link https://orm.drizzle.team/docs/select#with-clause}
   *
   * @param queries The CTEs to incorporate into the main query.
   *
   * @example
   *
   * ```ts
   * // Define a subquery 'sq' as a CTE using $with
   * const sq = db.$with('sq').as(db.select().from(users).where(eq(users.id, 42)));
   *
   * // Incorporate the CTE 'sq' into the main query and select from it
   * const result = await db.with(sq).select().from(sq);
   * ```
   */
  with(...queries) {
    const self = this;
    function select(fields) {
      return new MySqlSelectBuilder({
        fields: fields ?? void 0,
        session: self.session,
        dialect: self.dialect,
        withList: queries
      });
    }
    function selectDistinct(fields) {
      return new MySqlSelectBuilder({
        fields: fields ?? void 0,
        session: self.session,
        dialect: self.dialect,
        withList: queries,
        distinct: true
      });
    }
    function update(table) {
      return new MySqlUpdateBuilder(table, self.session, self.dialect, queries);
    }
    function delete_(table) {
      return new MySqlDeleteBase(table, self.session, self.dialect, queries);
    }
    return { select, selectDistinct, update, delete: delete_ };
  }
  select(fields) {
    return new MySqlSelectBuilder({ fields: fields ?? void 0, session: this.session, dialect: this.dialect });
  }
  selectDistinct(fields) {
    return new MySqlSelectBuilder({
      fields: fields ?? void 0,
      session: this.session,
      dialect: this.dialect,
      distinct: true
    });
  }
  /**
   * Creates an update query.
   *
   * Calling this method without `.where()` clause will update all rows in a table. The `.where()` clause specifies which rows should be updated.
   *
   * Use `.set()` method to specify which values to update.
   *
   * See docs: {@link https://orm.drizzle.team/docs/update}
   *
   * @param table The table to update.
   *
   * @example
   *
   * ```ts
   * // Update all rows in the 'cars' table
   * await db.update(cars).set({ color: 'red' });
   *
   * // Update rows with filters and conditions
   * await db.update(cars).set({ color: 'red' }).where(eq(cars.brand, 'BMW'));
   * ```
   */
  update(table) {
    return new MySqlUpdateBuilder(table, this.session, this.dialect);
  }
  /**
   * Creates an insert query.
   *
   * Calling this method will create new rows in a table. Use `.values()` method to specify which values to insert.
   *
   * See docs: {@link https://orm.drizzle.team/docs/insert}
   *
   * @param table The table to insert into.
   *
   * @example
   *
   * ```ts
   * // Insert one row
   * await db.insert(cars).values({ brand: 'BMW' });
   *
   * // Insert multiple rows
   * await db.insert(cars).values([{ brand: 'BMW' }, { brand: 'Porsche' }]);
   * ```
   */
  insert(table) {
    return new MySqlInsertBuilder(table, this.session, this.dialect);
  }
  /**
   * Creates a delete query.
   *
   * Calling this method without `.where()` clause will delete all rows in a table. The `.where()` clause specifies which rows should be deleted.
   *
   * See docs: {@link https://orm.drizzle.team/docs/delete}
   *
   * @param table The table to delete from.
   *
   * @example
   *
   * ```ts
   * // Delete all rows in the 'cars' table
   * await db.delete(cars);
   *
   * // Delete rows with filters and conditions
   * await db.delete(cars).where(eq(cars.color, 'green'));
   * ```
   */
  delete(table) {
    return new MySqlDeleteBase(table, this.session, this.dialect);
  }
  execute(query) {
    return this.session.execute(typeof query === "string" ? sql.raw(query) : query.getSQL());
  }
  transaction(transaction, config2) {
    return this.session.transaction(transaction, config2);
  }
};

// node_modules/drizzle-orm/mysql2/session.js
var import_node_events = require("node:events");

// node_modules/drizzle-orm/mysql-core/session.js
var MySqlPreparedQuery = class {
  static [entityKind] = "MySqlPreparedQuery";
  /** @internal */
  joinsNotNullableMap;
};
var MySqlSession = class {
  constructor(dialect) {
    this.dialect = dialect;
  }
  static [entityKind] = "MySqlSession";
  execute(query) {
    return this.prepareQuery(
      this.dialect.sqlToQuery(query),
      void 0
    ).execute();
  }
  async count(sql2) {
    const res = await this.execute(sql2);
    return Number(
      res[0][0]["count"]
    );
  }
  getSetTransactionSQL(config2) {
    const parts = [];
    if (config2.isolationLevel) {
      parts.push(`isolation level ${config2.isolationLevel}`);
    }
    return parts.length ? sql`set transaction ${sql.raw(parts.join(" "))}` : void 0;
  }
  getStartTransactionSQL(config2) {
    const parts = [];
    if (config2.withConsistentSnapshot) {
      parts.push("with consistent snapshot");
    }
    if (config2.accessMode) {
      parts.push(config2.accessMode);
    }
    return parts.length ? sql`start transaction ${sql.raw(parts.join(" "))}` : void 0;
  }
};
var MySqlTransaction = class extends MySqlDatabase {
  constructor(dialect, session, schema, nestedIndex, mode) {
    super(dialect, session, schema, mode);
    this.schema = schema;
    this.nestedIndex = nestedIndex;
  }
  static [entityKind] = "MySqlTransaction";
  rollback() {
    throw new TransactionRollbackError();
  }
};

// node_modules/drizzle-orm/mysql2/session.js
var MySql2PreparedQuery = class extends MySqlPreparedQuery {
  constructor(client, queryString, params, logger, fields, customResultMapper, generatedIds, returningIds) {
    super();
    this.client = client;
    this.params = params;
    this.logger = logger;
    this.fields = fields;
    this.customResultMapper = customResultMapper;
    this.generatedIds = generatedIds;
    this.returningIds = returningIds;
    this.rawQuery = {
      sql: queryString,
      // rowsAsArray: true,
      typeCast: function(field, next) {
        if (field.type === "TIMESTAMP" || field.type === "DATETIME" || field.type === "DATE") {
          return field.string();
        }
        return next();
      }
    };
    this.query = {
      sql: queryString,
      rowsAsArray: true,
      typeCast: function(field, next) {
        if (field.type === "TIMESTAMP" || field.type === "DATETIME" || field.type === "DATE") {
          return field.string();
        }
        return next();
      }
    };
  }
  static [entityKind] = "MySql2PreparedQuery";
  rawQuery;
  query;
  async execute(placeholderValues = {}) {
    const params = fillPlaceholders(this.params, placeholderValues);
    this.logger.logQuery(this.rawQuery.sql, params);
    const { fields, client, rawQuery, query, joinsNotNullableMap, customResultMapper, returningIds, generatedIds } = this;
    if (!fields && !customResultMapper) {
      const res = await client.query(rawQuery, params);
      const insertId = res[0].insertId;
      const affectedRows = res[0].affectedRows;
      if (returningIds) {
        const returningResponse = [];
        let j = 0;
        for (let i = insertId; i < insertId + affectedRows; i++) {
          for (const column of returningIds) {
            const key = returningIds[0].path[0];
            if (is(column.field, Column)) {
              if (column.field.primary && column.field.autoIncrement) {
                returningResponse.push({ [key]: i });
              }
              if (column.field.defaultFn && generatedIds) {
                returningResponse.push({ [key]: generatedIds[j][key] });
              }
            }
          }
          j++;
        }
        return returningResponse;
      }
      return res;
    }
    const result = await client.query(query, params);
    const rows = result[0];
    if (customResultMapper) {
      return customResultMapper(rows);
    }
    return rows.map((row) => mapResultRow(fields, row, joinsNotNullableMap));
  }
  async *iterator(placeholderValues = {}) {
    const params = fillPlaceholders(this.params, placeholderValues);
    const conn = (isPool(this.client) ? await this.client.getConnection() : this.client).connection;
    const { fields, query, rawQuery, joinsNotNullableMap, client, customResultMapper } = this;
    const hasRowsMapper = Boolean(fields || customResultMapper);
    const driverQuery = hasRowsMapper ? conn.query(query, params) : conn.query(rawQuery, params);
    const stream = driverQuery.stream();
    function dataListener() {
      stream.pause();
    }
    stream.on("data", dataListener);
    try {
      const onEnd = (0, import_node_events.once)(stream, "end");
      const onError = (0, import_node_events.once)(stream, "error");
      while (true) {
        stream.resume();
        const row = await Promise.race([onEnd, onError, new Promise((resolve) => stream.once("data", resolve))]);
        if (row === void 0 || Array.isArray(row) && row.length === 0) {
          break;
        } else if (row instanceof Error) {
          throw row;
        } else {
          if (hasRowsMapper) {
            if (customResultMapper) {
              const mappedRow = customResultMapper([row]);
              yield Array.isArray(mappedRow) ? mappedRow[0] : mappedRow;
            } else {
              yield mapResultRow(fields, row, joinsNotNullableMap);
            }
          } else {
            yield row;
          }
        }
      }
    } finally {
      stream.off("data", dataListener);
      if (isPool(client)) {
        conn.end();
      }
    }
  }
};
var MySql2Session = class _MySql2Session extends MySqlSession {
  constructor(client, dialect, schema, options) {
    super(dialect);
    this.client = client;
    this.schema = schema;
    this.options = options;
    this.logger = options.logger ?? new NoopLogger();
    this.mode = options.mode;
  }
  static [entityKind] = "MySql2Session";
  logger;
  mode;
  prepareQuery(query, fields, customResultMapper, generatedIds, returningIds) {
    return new MySql2PreparedQuery(
      this.client,
      query.sql,
      query.params,
      this.logger,
      fields,
      customResultMapper,
      generatedIds,
      returningIds
    );
  }
  /**
   * @internal
   * What is its purpose?
   */
  async query(query, params) {
    this.logger.logQuery(query, params);
    const result = await this.client.query({
      sql: query,
      values: params,
      rowsAsArray: true,
      typeCast: function(field, next) {
        if (field.type === "TIMESTAMP" || field.type === "DATETIME" || field.type === "DATE") {
          return field.string();
        }
        return next();
      }
    });
    return result;
  }
  all(query) {
    const querySql = this.dialect.sqlToQuery(query);
    this.logger.logQuery(querySql.sql, querySql.params);
    return this.client.execute(querySql.sql, querySql.params).then((result) => result[0]);
  }
  async transaction(transaction, config2) {
    const session = isPool(this.client) ? new _MySql2Session(
      await this.client.getConnection(),
      this.dialect,
      this.schema,
      this.options
    ) : this;
    const tx = new MySql2Transaction(
      this.dialect,
      session,
      this.schema,
      0,
      this.mode
    );
    if (config2) {
      const setTransactionConfigSql = this.getSetTransactionSQL(config2);
      if (setTransactionConfigSql) {
        await tx.execute(setTransactionConfigSql);
      }
      const startTransactionSql = this.getStartTransactionSQL(config2);
      await (startTransactionSql ? tx.execute(startTransactionSql) : tx.execute(sql`begin`));
    } else {
      await tx.execute(sql`begin`);
    }
    try {
      const result = await transaction(tx);
      await tx.execute(sql`commit`);
      return result;
    } catch (err) {
      await tx.execute(sql`rollback`);
      throw err;
    } finally {
      if (isPool(this.client)) {
        session.client.release();
      }
    }
  }
};
var MySql2Transaction = class _MySql2Transaction extends MySqlTransaction {
  static [entityKind] = "MySql2Transaction";
  async transaction(transaction) {
    const savepointName = `sp${this.nestedIndex + 1}`;
    const tx = new _MySql2Transaction(
      this.dialect,
      this.session,
      this.schema,
      this.nestedIndex + 1,
      this.mode
    );
    await tx.execute(sql.raw(`savepoint ${savepointName}`));
    try {
      const result = await transaction(tx);
      await tx.execute(sql.raw(`release savepoint ${savepointName}`));
      return result;
    } catch (err) {
      await tx.execute(sql.raw(`rollback to savepoint ${savepointName}`));
      throw err;
    }
  }
};
function isPool(client) {
  return "getConnection" in client;
}

// node_modules/drizzle-orm/mysql2/driver.js
var MySql2Driver = class {
  constructor(client, dialect, options = {}) {
    this.client = client;
    this.dialect = dialect;
    this.options = options;
  }
  static [entityKind] = "MySql2Driver";
  createSession(schema, mode) {
    return new MySql2Session(this.client, this.dialect, schema, { logger: this.options.logger, mode });
  }
};
var MySql2Database = class extends MySqlDatabase {
  static [entityKind] = "MySql2Database";
};
function construct(client, config2 = {}) {
  const dialect = new MySqlDialect({ casing: config2.casing });
  let logger;
  if (config2.logger === true) {
    logger = new DefaultLogger();
  } else if (config2.logger !== false) {
    logger = config2.logger;
  }
  const clientForInstance = isCallbackClient(client) ? client.promise() : client;
  let schema;
  if (config2.schema) {
    if (config2.mode === void 0) {
      throw new DrizzleError({
        message: 'You need to specify "mode": "planetscale" or "default" when providing a schema. Read more: https://orm.drizzle.team/docs/rqb#modes'
      });
    }
    const tablesConfig = extractTablesRelationalConfig(
      config2.schema,
      createTableRelationsHelpers
    );
    schema = {
      fullSchema: config2.schema,
      schema: tablesConfig.tables,
      tableNamesMap: tablesConfig.tableNamesMap
    };
  }
  const mode = config2.mode ?? "default";
  const driver = new MySql2Driver(clientForInstance, dialect, { logger });
  const session = driver.createSession(schema, mode);
  const db2 = new MySql2Database(dialect, session, schema, mode);
  db2.$client = client;
  return db2;
}
function isCallbackClient(client) {
  return typeof client.promise === "function";
}
function drizzle(...params) {
  if (typeof params[0] === "string") {
    const connectionString = params[0];
    const instance = (0, import_mysql2.createPool)({
      uri: connectionString
    });
    return construct(instance, params[1]);
  }
  if (isConfig(params[0])) {
    const { connection, client, ...drizzleConfig } = params[0];
    if (client)
      return construct(client, drizzleConfig);
    const instance = typeof connection === "string" ? (0, import_mysql2.createPool)({
      uri: connection
    }) : (0, import_mysql2.createPool)(connection);
    const db2 = construct(instance, drizzleConfig);
    return db2;
  }
  return construct(params[0], params[1]);
}
((drizzle2) => {
  function mock(config2) {
    return construct({}, config2);
  }
  drizzle2.mock = mock;
})(drizzle || (drizzle = {}));

// server/db.ts
var import_promise = __toESM(require("mysql2/promise"));

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  activityLogs: () => activityLogs,
  appSettings: () => appSettings,
  bookings: () => bookings,
  bookmarkTable: () => bookmarkTable,
  commissions: () => commissions,
  coupons: () => coupons,
  customerNotes: () => customerNotes,
  expenses: () => expenses,
  insertUserSchema: () => insertUserSchema,
  inventory: () => inventory,
  licenseActivations: () => licenseActivations,
  licenseKeys: () => licenseKeys,
  loyaltyTransactions: () => loyaltyTransactions,
  messages: () => messages,
  notifications: () => notifications,
  packages: () => packages,
  plans: () => plans,
  reviews: () => reviews,
  salonStaff: () => salonStaff,
  salons: () => salons,
  services: () => services,
  shifts: () => shifts,
  specialists: () => specialists,
  subscriptions: () => subscriptions,
  tips: () => tips,
  users: () => users
});
var import_crypto = __toESM(require("crypto"));

// node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k) => typeof obj[obj[k]] !== "number");
    const filtered = {};
    for (const k of validKeys) {
      filtered[k] = obj[k];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e) {
      return obj[e];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second) => {
    return {
      ...first,
      ...second
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t = typeof data;
  switch (t) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json2 = JSON.stringify(obj, null, 2);
  return json2.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i = 0;
          while (i < issue.path.length) {
            const el = issue.path[i];
            const terminal = i === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path: path2, errorMaps, issueData } = params;
  const fullPath = [...path2, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage = "";
  const maps = errorMaps.filter((m) => !!m).slice().reverse();
  for (const map of maps) {
    errorMessage = map(fullIssue, { data, defaultError: errorMessage }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x) => !!x)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s of results) {
      if (s.status === "aborted")
        return INVALID;
      if (s.status === "dirty")
        status.dirty();
      arrayValue.push(s.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x) => x.status === "aborted";
var isDirty = (x) => x.status === "dirty";
var isValid = (x) => x.status === "valid";
var isAsync = (x) => typeof Promise !== "undefined" && x instanceof Promise;

// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path2, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path2;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err) {
        if (err?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a, b) {
  const aType = getParsedType(a);
  const bType = getParsedType(b);
  if (a === b) {
    return { valid: true, data: a };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b);
    const sharedKeys = util.objectKeys(a).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a, ...b };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a[key], b[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a.length !== b.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a.length; index++) {
      const itemA = a[index];
      const itemB = b[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a === +b) {
    return { valid: true, data: a };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x) => !!x);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second, third) {
    if (second instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x) => !!x),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me._def.args.parseAsync(args, params).catch((e) => {
          error.addIssue(makeArgsIssue(args, e));
          throw error;
        });
        const result = await Reflect.apply(fn, this, parsedArgs);
        const parsedReturns = await me._def.returns._def.type.parseAsync(result, params).catch((e) => {
          error.addIssue(makeReturnsIssue(result, e));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me = this;
      return OK(function(...args) {
        const parsedArgs = me._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn, this, parsedArgs.data);
        const parsedReturns = me._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a, b) {
    return new _ZodPipeline({
      in: a,
      out: b,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p2 = typeof p === "string" ? { message: p } : p;
  return p2;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r = check(data);
      if (r instanceof Promise) {
        return r.then((r2) => {
          if (!r2) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// node_modules/drizzle-zod/index.mjs
var CONSTANTS = {
  INT8_MIN: -128,
  INT8_MAX: 127,
  INT8_UNSIGNED_MAX: 255,
  INT16_MIN: -32768,
  INT16_MAX: 32767,
  INT16_UNSIGNED_MAX: 65535,
  INT24_MIN: -8388608,
  INT24_MAX: 8388607,
  INT24_UNSIGNED_MAX: 16777215,
  INT32_MIN: -2147483648,
  INT32_MAX: 2147483647,
  INT32_UNSIGNED_MAX: 4294967295,
  INT48_MIN: -140737488355328,
  INT48_MAX: 140737488355327,
  INT48_UNSIGNED_MAX: 281474976710655,
  INT64_MIN: -9223372036854775808n,
  INT64_MAX: 9223372036854775807n,
  INT64_UNSIGNED_MAX: 18446744073709551615n
};
function isColumnType(column, columnTypes) {
  return columnTypes.includes(column.columnType);
}
function isWithEnum(column) {
  return "enumValues" in column && Array.isArray(column.enumValues) && column.enumValues.length > 0;
}
var literalSchema = external_exports.union([external_exports.string(), external_exports.number(), external_exports.boolean(), external_exports.null()]);
var jsonSchema = external_exports.union([literalSchema, external_exports.record(external_exports.any()), external_exports.array(external_exports.any())]);
var bufferSchema = external_exports.custom((v) => v instanceof Buffer);
function columnToSchema(column, factory) {
  const z$1 = factory?.zodInstance ?? external_exports;
  const coerce2 = factory?.coerce ?? {};
  let schema;
  if (isWithEnum(column)) {
    schema = column.enumValues.length ? z$1.enum(column.enumValues) : z$1.string();
  }
  if (!schema) {
    if (isColumnType(column, ["PgGeometry", "PgPointTuple"])) {
      schema = z$1.tuple([z$1.number(), z$1.number()]);
    } else if (isColumnType(column, ["PgGeometryObject", "PgPointObject"])) {
      schema = z$1.object({ x: z$1.number(), y: z$1.number() });
    } else if (isColumnType(column, ["PgHalfVector", "PgVector"])) {
      schema = z$1.array(z$1.number());
      schema = column.dimensions ? schema.length(column.dimensions) : schema;
    } else if (isColumnType(column, ["PgLine"])) {
      schema = z$1.tuple([z$1.number(), z$1.number(), z$1.number()]);
    } else if (isColumnType(column, ["PgLineABC"])) {
      schema = z$1.object({
        a: z$1.number(),
        b: z$1.number(),
        c: z$1.number()
      });
    } else if (isColumnType(column, ["PgArray"])) {
      schema = z$1.array(columnToSchema(column.baseColumn, z$1));
      schema = column.size ? schema.length(column.size) : schema;
    } else if (column.dataType === "array") {
      schema = z$1.array(z$1.any());
    } else if (column.dataType === "number") {
      schema = numberColumnToSchema(column, z$1, coerce2);
    } else if (column.dataType === "bigint") {
      schema = bigintColumnToSchema(column, z$1, coerce2);
    } else if (column.dataType === "boolean") {
      schema = coerce2 === true || coerce2.boolean ? z$1.coerce.boolean() : z$1.boolean();
    } else if (column.dataType === "date") {
      schema = coerce2 === true || coerce2.date ? z$1.coerce.date() : z$1.date();
    } else if (column.dataType === "string") {
      schema = stringColumnToSchema(column, z$1, coerce2);
    } else if (column.dataType === "json") {
      schema = jsonSchema;
    } else if (column.dataType === "custom") {
      schema = z$1.any();
    } else if (column.dataType === "buffer") {
      schema = bufferSchema;
    }
  }
  if (!schema) {
    schema = z$1.any();
  }
  return schema;
}
function numberColumnToSchema(column, z, coerce2) {
  let unsigned = column.getSQLType().includes("unsigned");
  let min;
  let max;
  let integer = false;
  if (isColumnType(column, ["MySqlTinyInt", "SingleStoreTinyInt"])) {
    min = unsigned ? 0 : CONSTANTS.INT8_MIN;
    max = unsigned ? CONSTANTS.INT8_UNSIGNED_MAX : CONSTANTS.INT8_MAX;
    integer = true;
  } else if (isColumnType(column, [
    "PgSmallInt",
    "PgSmallSerial",
    "MySqlSmallInt",
    "SingleStoreSmallInt"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT16_MIN;
    max = unsigned ? CONSTANTS.INT16_UNSIGNED_MAX : CONSTANTS.INT16_MAX;
    integer = true;
  } else if (isColumnType(column, [
    "PgReal",
    "MySqlFloat",
    "MySqlMediumInt",
    "SingleStoreMediumInt",
    "SingleStoreFloat"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT24_MIN;
    max = unsigned ? CONSTANTS.INT24_UNSIGNED_MAX : CONSTANTS.INT24_MAX;
    integer = isColumnType(column, ["MySqlMediumInt", "SingleStoreMediumInt"]);
  } else if (isColumnType(column, [
    "PgInteger",
    "PgSerial",
    "MySqlInt",
    "SingleStoreInt"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT32_MIN;
    max = unsigned ? CONSTANTS.INT32_UNSIGNED_MAX : CONSTANTS.INT32_MAX;
    integer = true;
  } else if (isColumnType(column, [
    "PgDoublePrecision",
    "MySqlReal",
    "MySqlDouble",
    "SingleStoreReal",
    "SingleStoreDouble",
    "SQLiteReal"
  ])) {
    min = unsigned ? 0 : CONSTANTS.INT48_MIN;
    max = unsigned ? CONSTANTS.INT48_UNSIGNED_MAX : CONSTANTS.INT48_MAX;
  } else if (isColumnType(column, [
    "PgBigInt53",
    "PgBigSerial53",
    "MySqlBigInt53",
    "MySqlSerial",
    "SingleStoreBigInt53",
    "SingleStoreSerial",
    "SQLiteInteger"
  ])) {
    unsigned = unsigned || isColumnType(column, ["MySqlSerial", "SingleStoreSerial"]);
    min = unsigned ? 0 : Number.MIN_SAFE_INTEGER;
    max = Number.MAX_SAFE_INTEGER;
    integer = true;
  } else if (isColumnType(column, ["MySqlYear", "SingleStoreYear"])) {
    min = 1901;
    max = 2155;
    integer = true;
  } else {
    min = Number.MIN_SAFE_INTEGER;
    max = Number.MAX_SAFE_INTEGER;
  }
  let schema = coerce2 === true || coerce2?.number ? z.coerce.number() : z.number();
  schema = schema.min(min).max(max);
  return integer ? schema.int() : schema;
}
function bigintColumnToSchema(column, z, coerce2) {
  const unsigned = column.getSQLType().includes("unsigned");
  const min = unsigned ? 0n : CONSTANTS.INT64_MIN;
  const max = unsigned ? CONSTANTS.INT64_UNSIGNED_MAX : CONSTANTS.INT64_MAX;
  const schema = coerce2 === true || coerce2?.bigint ? z.coerce.bigint() : z.bigint();
  return schema.min(min).max(max);
}
function stringColumnToSchema(column, z, coerce2) {
  if (isColumnType(column, ["PgUUID"])) {
    return z.string().uuid();
  }
  let max;
  let regex;
  let fixed = false;
  if (isColumnType(column, ["PgVarchar", "SQLiteText"])) {
    max = column.length;
  } else if (isColumnType(column, ["MySqlVarChar", "SingleStoreVarChar"])) {
    max = column.length ?? CONSTANTS.INT16_UNSIGNED_MAX;
  } else if (isColumnType(column, ["MySqlText", "SingleStoreText"])) {
    if (column.textType === "longtext") {
      max = CONSTANTS.INT32_UNSIGNED_MAX;
    } else if (column.textType === "mediumtext") {
      max = CONSTANTS.INT24_UNSIGNED_MAX;
    } else if (column.textType === "text") {
      max = CONSTANTS.INT16_UNSIGNED_MAX;
    } else {
      max = CONSTANTS.INT8_UNSIGNED_MAX;
    }
  }
  if (isColumnType(column, [
    "PgChar",
    "MySqlChar",
    "SingleStoreChar"
  ])) {
    max = column.length;
    fixed = true;
  }
  if (isColumnType(column, ["PgBinaryVector"])) {
    regex = /^[01]+$/;
    max = column.dimensions;
  }
  let schema = coerce2 === true || coerce2?.string ? z.coerce.string() : z.string();
  schema = regex ? schema.regex(regex) : schema;
  return max && fixed ? schema.length(max) : max ? schema.max(max) : schema;
}
function getColumns(tableLike) {
  return isTable(tableLike) ? getTableColumns(tableLike) : getViewSelectedFields(tableLike);
}
function handleColumns(columns, refinements, conditions, factory) {
  const columnSchemas = {};
  for (const [key, selected] of Object.entries(columns)) {
    if (!is(selected, Column) && !is(selected, SQL) && !is(selected, SQL.Aliased) && typeof selected === "object") {
      const columns2 = isTable(selected) || isView(selected) ? getColumns(selected) : selected;
      columnSchemas[key] = handleColumns(columns2, refinements[key] ?? {}, conditions, factory);
      continue;
    }
    const refinement = refinements[key];
    if (refinement !== void 0 && typeof refinement !== "function") {
      columnSchemas[key] = refinement;
      continue;
    }
    const column = is(selected, Column) ? selected : void 0;
    const schema = column ? columnToSchema(column, factory) : external_exports.any();
    const refined = typeof refinement === "function" ? refinement(schema) : schema;
    if (conditions.never(column)) {
      continue;
    } else {
      columnSchemas[key] = refined;
    }
    if (column) {
      if (conditions.nullable(column)) {
        columnSchemas[key] = columnSchemas[key].nullable();
      }
      if (conditions.optional(column)) {
        columnSchemas[key] = columnSchemas[key].optional();
      }
    }
  }
  return external_exports.object(columnSchemas);
}
var insertConditions = {
  never: (column) => column?.generated?.type === "always" || column?.generatedIdentity?.type === "always",
  optional: (column) => !column.notNull || column.notNull && column.hasDefault,
  nullable: (column) => !column.notNull
};
var createInsertSchema = (entity, refine) => {
  const columns = getColumns(entity);
  return handleColumns(columns, refine ?? {}, insertConditions);
};

// shared/schema.ts
var users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  fullName: text("full_name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone").default(""),
  avatar: text("avatar").default(""),
  nickname: text("nickname").default(""),
  gender: text("gender").default(""),
  dob: text("dob").default(""),
  role: text("role").default("user"),
  // user | admin | super_admin | salon_admin | staff
  loyaltyPoints: int("loyalty_points").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var salons = mysqlTable("salons", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  name: text("name").notNull(),
  image: text("image").notNull(),
  address: text("address").notNull(),
  distance: text("distance").default("0 km"),
  rating: double("rating").default(0),
  reviewCount: int("review_count").default(0),
  isOpen: boolean("is_open").default(true),
  openHours: text("open_hours").default("9:00 AM - 9:00 PM"),
  phone: text("phone").default(""),
  about: text("about").default(""),
  website: text("website").default(""),
  latitude: double("latitude").default(0),
  longitude: double("longitude").default(0),
  gallery: json("gallery").$type().default([]),
  status: text("status").default("active"),
  // active | suspended | deactivated
  ownerId: varchar("owner_id", { length: 255 }).default(""),
  // salon_admin user id
  landingEnabled: boolean("landing_enabled").default(false),
  landingSlug: text("landing_slug").default(""),
  landingViews: int("landing_views").default(0),
  landingTheme: text("landing_theme").default("dark"),
  // dark | light
  landingAccentColor: text("landing_accent_color").default("#F4A460"),
  landingBookingUrl: text("landing_booking_url").default("")
});
var salonStaff = mysqlTable("salon_staff", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  userId: varchar("user_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  role: text("role").notNull().default("staff"),
  // salon_admin | staff
  createdAt: timestamp("created_at").defaultNow()
});
var plans = mysqlTable("plans", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  name: text("name").notNull(),
  // Basic | Pro | Enterprise
  price: double("price").notNull().default(0),
  billingCycle: text("billing_cycle").notNull().default("monthly"),
  // monthly | annual
  features: json("features").$type().default([]),
  commissionRate: double("commission_rate").default(5),
  // platform commission %
  maxBookings: int("max_bookings").default(0),
  // 0 = unlimited
  maxStaff: int("max_staff").default(0),
  // 0 = unlimited
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var subscriptions = mysqlTable("subscriptions", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  planId: varchar("plan_id", { length: 255 }).notNull(),
  status: text("status").notNull().default("active"),
  // active | expired | suspended | cancelled
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var licenseKeys = mysqlTable("license_keys", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  key: varchar("key", { length: 255 }).notNull().unique(),
  salonId: varchar("salon_id", { length: 255 }).default(""),
  // empty = unassigned
  planId: varchar("plan_id", { length: 255 }).default(""),
  status: text("status").notNull().default("unused"),
  // unused | active | revoked
  expiresAt: text("expires_at").default(""),
  maxActivations: int("max_activations").default(0),
  // 0 = unlimited
  activationCount: int("activation_count").default(0),
  // how many devices activated
  createdAt: timestamp("created_at").defaultNow()
});
var licenseActivations = mysqlTable("license_activations", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  licenseKeyId: varchar("license_key_id", { length: 255 }).notNull(),
  deviceId: text("device_id").notNull(),
  email: text("email").default(""),
  activatedAt: timestamp("activated_at").defaultNow()
});
var activityLogs = mysqlTable("activity_logs", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  userId: varchar("user_id", { length: 255 }).default(""),
  userRole: text("user_role").default(""),
  action: text("action").notNull(),
  // e.g. "user.login", "booking.created", "salon.deactivated"
  entityType: text("entity_type").default(""),
  // user | salon | booking | subscription
  entityId: varchar("entity_id", { length: 255 }).default(""),
  metadata: json("metadata").$type().default({}),
  createdAt: timestamp("created_at").defaultNow()
});
var commissions = mysqlTable("commissions", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  bookingId: varchar("booking_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  amount: double("amount").notNull().default(0),
  rate: double("rate").notNull().default(5),
  status: text("status").notNull().default("pending"),
  // pending | paid
  createdAt: timestamp("created_at").defaultNow()
});
var expenses = mysqlTable("expenses", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  description: text("description").notNull(),
  amount: double("amount").notNull(),
  category: text("category").default("general"),
  // rent | supplies | utilities | salaries | general
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var shifts = mysqlTable("shifts", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  staffId: varchar("staff_id", { length: 255 }).notNull(),
  // references users.id
  dayOfWeek: int("day_of_week").notNull(),
  // 0=Sunday, 6=Saturday
  startTime: text("start_time").notNull(),
  // "09:00"
  endTime: text("end_time").notNull(),
  // "17:00"
  createdAt: timestamp("created_at").defaultNow()
});
var services = mysqlTable("services", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  name: text("name").notNull(),
  price: double("price").notNull(),
  duration: text("duration").notNull(),
  image: text("image").default(""),
  category: text("category").default("")
});
var packages = mysqlTable("packages", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  name: text("name").notNull(),
  price: double("price").notNull(),
  originalPrice: double("original_price").notNull(),
  services: json("services").$type().default([]),
  image: text("image").default("")
});
var specialists = mysqlTable("specialists", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  image: text("image").default(""),
  rating: double("rating").default(0)
});
var reviews = mysqlTable("reviews", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }),
  userName: text("user_name").notNull(),
  userImage: text("user_image").default(""),
  rating: int("rating").notNull(),
  comment: text("comment").default(""),
  date: text("date").default(""),
  createdAt: timestamp("created_at").defaultNow()
});
var bookings = mysqlTable("bookings", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  userId: varchar("user_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  salonName: text("salon_name").notNull(),
  salonImage: text("salon_image").default(""),
  services: json("services_list").$type().default([]),
  date: text("date").notNull(),
  time: text("time").notNull(),
  totalPrice: double("total_price").notNull(),
  status: text("status").notNull().default("upcoming"),
  paymentMethod: text("payment_method").default(""),
  specialistId: varchar("specialist_id", { length: 255 }).default(""),
  createdAt: timestamp("created_at").defaultNow()
});
var bookmarkTable = mysqlTable("bookmarks", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  userId: varchar("user_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var messages = mysqlTable("messages", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  userId: varchar("user_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  salonName: text("salon_name").notNull(),
  salonImage: text("salon_image").default(""),
  content: text("content").notNull(),
  sender: text("sender").notNull().default("salon"),
  createdAt: timestamp("created_at").defaultNow()
});
var notifications = mysqlTable("notifications", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull().default("system"),
  read: boolean("read").default(false),
  createdAt: timestamp("created_at").defaultNow()
});
var coupons = mysqlTable("coupons", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  code: varchar("code", { length: 255 }).notNull().unique(),
  discount: double("discount").notNull(),
  type: text("type").notNull().default("percentage"),
  expiryDate: text("expiry_date").notNull(),
  usageLimit: int("usage_limit").default(0),
  usedCount: int("used_count").default(0),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow()
});
var inventory = mysqlTable("inventory", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  name: text("name").notNull(),
  category: text("category").default("general"),
  // tools | products | supplies
  quantity: int("quantity").default(0),
  minQuantity: int("min_quantity").default(5),
  unit: text("unit").default("pcs"),
  price: double("price").default(0),
  createdAt: timestamp("created_at").defaultNow()
});
var tips = mysqlTable("tips", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  bookingId: varchar("booking_id", { length: 255 }).notNull(),
  staffId: varchar("staff_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  amount: double("amount").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var customerNotes = mysqlTable("customer_notes", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  salonId: varchar("salon_id", { length: 255 }).notNull(),
  customerId: varchar("customer_id", { length: 255 }).notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var loyaltyTransactions = mysqlTable("loyalty_transactions", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  userId: varchar("user_id", { length: 255 }).notNull(),
  salonId: varchar("salon_id", { length: 255 }).default(""),
  points: int("points").notNull(),
  // positive = earned, negative = redeemed
  type: text("type").notNull().default("earned"),
  // earned | redeemed
  description: text("description").default(""),
  createdAt: timestamp("created_at").defaultNow()
});
var appSettings = mysqlTable("app_settings", {
  id: varchar("id", { length: 255 }).primaryKey().$defaultFn(() => import_crypto.default.randomUUID()),
  key: varchar("key", { length: 255 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description").default(""),
  updatedAt: timestamp("updated_at").defaultNow()
});
var insertUserSchema = createInsertSchema(users).pick({
  fullName: true,
  email: true,
  password: true
});

// server/db.ts
dotenv.config({ path: import_path.default.resolve(process.cwd(), ".env") });
var pool = import_promise.default.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});
var db = drizzle(pool, { schema: schema_exports, mode: "default" });

// server/seed.ts
var salonHeroImages = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&h=600&fit=crop",
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=800&h=600&fit=crop"
];
var serviceImages = {
  haircut: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=200&h=200&fit=crop",
  hairColor: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=200&h=200&fit=crop",
  facialMakeup: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=200&h=200&fit=crop",
  nails: "https://images.unsplash.com/photo-1519823551278-64ac92734314?w=200&h=200&fit=crop",
  massage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=200&h=200&fit=crop",
  facial: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=200&h=200&fit=crop"
};
var specialistImages = [
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop"
];
var reviewerImages = [
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
];
var galleryBase = [
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1622288432450-277d0fef5ed6?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1519823551278-64ac92734314?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&h=400&fit=crop"
];
function makeGallery(startIndex) {
  const result = [];
  for (let i = 0; i < 6; i++) {
    result.push(galleryBase[(startIndex + i) % galleryBase.length]);
  }
  return result;
}
var salonData = [
  {
    id: "1",
    name: "Alpine Groom",
    image: salonHeroImages[0],
    address: "Bahnhofstrasse 42, 8001 Zurich, Switzerland",
    distance: "0.8 km",
    rating: 4.9,
    reviewCount: 3742,
    isOpen: true,
    openHours: "9:00 AM - 7:00 PM",
    phone: "+41 44 123 4567",
    about: "Alpine Groom is a premier barbershop in the heart of Zurich, blending Swiss precision with modern grooming. Our skilled stylists deliver impeccable cuts, classic shaves, and tailored grooming experiences in an elegant, welcoming atmosphere.",
    website: "www.alpinegroom.ch",
    latitude: 47.3769,
    longitude: 8.5417,
    gallery: makeGallery(0)
  },
  {
    id: "2",
    name: "Geneva Elegance",
    image: salonHeroImages[1],
    address: "Rue du Rhone 58, 1204 Geneva, Switzerland",
    distance: "1.5 km",
    rating: 4.7,
    reviewCount: 2890,
    isOpen: true,
    openHours: "8:30 AM - 7:30 PM",
    phone: "+41 22 765 4321",
    about: "Geneva Elegance brings together the finest in European beauty and grooming. From luxurious hair treatments to revitalizing facials, our French-trained specialists craft an experience of refinement in the heart of Geneva.",
    website: "www.genevaelegance.ch",
    latitude: 46.2044,
    longitude: 6.1432,
    gallery: makeGallery(2)
  },
  {
    id: "3",
    name: "Bern Classic Barbers",
    image: salonHeroImages[2],
    address: "Marktgasse 15, 3011 Bern, Switzerland",
    distance: "2.1 km",
    rating: 4.8,
    reviewCount: 4156,
    isOpen: true,
    openHours: "9:00 AM - 6:30 PM",
    phone: "+41 31 890 1234",
    about: "Bern Classic Barbers is a traditional barbershop offering old-world craftsmanship in the Swiss capital. Our master barbers specialize in precision fades, straight-razor shaves, and meticulous beard grooming in a warm, vintage setting.",
    website: "www.bernclassicbarbers.ch",
    latitude: 46.948,
    longitude: 7.4474,
    gallery: makeGallery(4)
  },
  {
    id: "4",
    name: "Lausanne Luxe Spa",
    image: salonHeroImages[3],
    address: "Avenue de la Gare 12, 1003 Lausanne, Switzerland",
    distance: "3.0 km",
    rating: 4.9,
    reviewCount: 3520,
    isOpen: true,
    openHours: "8:00 AM - 9:00 PM",
    phone: "+41 21 456 7890",
    about: "Lausanne Luxe Spa offers a five-star wellness experience overlooking Lake Geneva. Our award-winning therapists provide signature treatments including hot stone massages, anti-aging facials, and premium hair styling in a tranquil lakeside retreat.",
    website: "www.lausanneluxespa.ch",
    latitude: 46.5197,
    longitude: 6.6323,
    gallery: makeGallery(6)
  },
  {
    id: "5",
    name: "Munich Edge Studio",
    image: salonHeroImages[5],
    address: "Maximilianstrasse 28, 80539 Munich, Germany",
    distance: "4.2 km",
    rating: 4.6,
    reviewCount: 2680,
    isOpen: true,
    openHours: "9:00 AM - 8:00 PM",
    phone: "+49 89 234 5678",
    about: "Munich Edge Studio is a cutting-edge barbershop and salon in the heart of Munich. Combining Bavarian tradition with contemporary trends, our team delivers bold styles, sharp fades, and creative color work that sets you apart.",
    website: "www.munichedgestudio.de",
    latitude: 48.1351,
    longitude: 11.582,
    gallery: makeGallery(1)
  },
  {
    id: "6",
    name: "Vienna Heritage Salon",
    image: salonHeroImages[6],
    address: "Karntner Strasse 34, 1010 Vienna, Austria",
    distance: "1.0 km",
    rating: 4.8,
    reviewCount: 3210,
    isOpen: true,
    openHours: "8:00 AM - 7:00 PM",
    phone: "+43 1 567 8901",
    about: "Vienna Heritage Salon is a family-run establishment celebrating over 30 years of excellence in grooming. Our warm, classic interior and expert stylists deliver timeless cuts, elegant updos, and personalized beauty services for all ages.",
    website: "www.viennaheritagesalon.at",
    latitude: 48.2082,
    longitude: 16.3738,
    gallery: makeGallery(3)
  },
  {
    id: "7",
    name: "Basel Wellness Studio",
    image: salonHeroImages[4],
    address: "Freie Strasse 22, 4001 Basel, Switzerland",
    distance: "1.8 km",
    rating: 4.9,
    reviewCount: 3890,
    isOpen: true,
    openHours: "9:00 AM - 8:30 PM",
    phone: "+41 61 345 6789",
    about: "Basel Wellness Studio is a holistic beauty and wellness destination in the cultural heart of Basel. From deep tissue massages to organic hair treatments and rejuvenating facials, every service is crafted for total relaxation and renewal.",
    website: "www.baselwellness.ch",
    latitude: 47.5596,
    longitude: 7.5886,
    gallery: makeGallery(5)
  },
  {
    id: "8",
    name: "Lucerne Style House",
    image: salonHeroImages[7],
    address: "Hertensteinstrasse 8, 6004 Lucerne, Switzerland",
    distance: "2.5 km",
    rating: 4.5,
    reviewCount: 1980,
    isOpen: true,
    openHours: "10:00 AM - 7:00 PM",
    phone: "+41 41 678 9012",
    about: "Lucerne Style House is a modern salon in the picturesque city of Lucerne, specializing in trend-forward cuts, vivid colors, and creative styling. Our passionate team brings international flair to every appointment.",
    website: "www.lucernestylehouse.ch",
    latitude: 47.0502,
    longitude: 8.3093,
    gallery: makeGallery(7)
  }
];
var salonServices = {
  "1": [
    { name: "Precision Haircut", price: 55, duration: "30 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Blow Dry & Style", price: 40, duration: "25 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Full Hair Color", price: 120, duration: "90 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Balayage Highlights", price: 180, duration: "120 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Deep Conditioning", price: 60, duration: "30 min", image: serviceImages.hairColor, category: "Hair Treatment" },
    { name: "Classic Facial", price: 75, duration: "45 min", image: serviceImages.facial, category: "Facial" },
    { name: "Hot Towel Shave", price: 45, duration: "30 min", image: serviceImages.haircut, category: "Shave" },
    { name: "Gel Manicure", price: 50, duration: "35 min", image: serviceImages.nails, category: "Nails" },
    { name: "Spa Pedicure", price: 60, duration: "45 min", image: serviceImages.nails, category: "Nails" },
    { name: "Relaxation Massage", price: 95, duration: "60 min", image: serviceImages.massage, category: "Massage" }
  ],
  "2": [
    { name: "Women's Haircut", price: 65, duration: "35 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Children's Haircut", price: 35, duration: "20 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Root Touch Up", price: 85, duration: "60 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Ombre Color", price: 160, duration: "120 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Keratin Treatment", price: 220, duration: "150 min", image: serviceImages.hairColor, category: "Hair Treatment" },
    { name: "Hydrating Facial", price: 80, duration: "50 min", image: serviceImages.facial, category: "Facial" },
    { name: "Evening Makeup", price: 90, duration: "60 min", image: serviceImages.facialMakeup, category: "Make Up" },
    { name: "Acrylic Nails", price: 65, duration: "60 min", image: serviceImages.nails, category: "Nails" },
    { name: "Swedish Massage", price: 100, duration: "60 min", image: serviceImages.massage, category: "Massage" },
    { name: "Eyebrow Shaping", price: 25, duration: "15 min", image: serviceImages.facialMakeup, category: "Make Up" }
  ],
  "3": [
    { name: "Classic Haircut", price: 45, duration: "25 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Buzz Cut", price: 30, duration: "15 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Hot Towel Shave", price: 40, duration: "30 min", image: serviceImages.haircut, category: "Shave" },
    { name: "Beard Trim", price: 25, duration: "15 min", image: serviceImages.haircut, category: "Beard" },
    { name: "Fade & Design", price: 55, duration: "40 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Hair & Beard Combo", price: 65, duration: "45 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Scalp Treatment", price: 40, duration: "20 min", image: serviceImages.massage, category: "Hair Treatment" },
    { name: "Gray Blending", price: 60, duration: "40 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Head Massage", price: 35, duration: "15 min", image: serviceImages.massage, category: "Massage" },
    { name: "Straight Razor Lineup", price: 20, duration: "10 min", image: serviceImages.haircut, category: "Shave" }
  ],
  "4": [
    { name: "Luxury Haircut", price: 80, duration: "40 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Diamond Facial", price: 130, duration: "60 min", image: serviceImages.facial, category: "Facial" },
    { name: "Gold Mask Treatment", price: 150, duration: "75 min", image: serviceImages.facial, category: "Facial" },
    { name: "Full Color & Gloss", price: 200, duration: "120 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Hot Stone Massage", price: 160, duration: "90 min", image: serviceImages.massage, category: "Massage" },
    { name: "Aromatherapy Massage", price: 140, duration: "75 min", image: serviceImages.massage, category: "Massage" },
    { name: "Deluxe Manicure", price: 70, duration: "45 min", image: serviceImages.nails, category: "Nails" },
    { name: "Deluxe Pedicure", price: 80, duration: "50 min", image: serviceImages.nails, category: "Nails" },
    { name: "Lash Extensions", price: 110, duration: "90 min", image: serviceImages.facialMakeup, category: "Make Up" }
  ],
  "5": [
    { name: "Men's Haircut", price: 45, duration: "25 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Skin Fade", price: 50, duration: "35 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Beard Sculpting", price: 35, duration: "20 min", image: serviceImages.haircut, category: "Beard" },
    { name: "Razor Shave", price: 40, duration: "25 min", image: serviceImages.haircut, category: "Shave" },
    { name: "Hair Design", price: 60, duration: "45 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Color Camo", price: 55, duration: "30 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Scalp Massage", price: 30, duration: "15 min", image: serviceImages.massage, category: "Massage" },
    { name: "Face Mask", price: 45, duration: "25 min", image: serviceImages.facial, category: "Facial" }
  ],
  "6": [
    { name: "Family Haircut", price: 40, duration: "25 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Children's Cut", price: 28, duration: "20 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Senior's Cut", price: 32, duration: "20 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Basic Color", price: 75, duration: "60 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Highlights", price: 110, duration: "90 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Express Facial", price: 50, duration: "30 min", image: serviceImages.facial, category: "Facial" },
    { name: "Quick Makeup", price: 55, duration: "30 min", image: serviceImages.facialMakeup, category: "Make Up" },
    { name: "Classic Manicure", price: 35, duration: "25 min", image: serviceImages.nails, category: "Nails" },
    { name: "Classic Pedicure", price: 40, duration: "30 min", image: serviceImages.nails, category: "Nails" },
    { name: "Back & Shoulder Massage", price: 65, duration: "30 min", image: serviceImages.massage, category: "Massage" }
  ],
  "7": [
    { name: "Signature Haircut", price: 65, duration: "35 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Anti-Aging Facial", price: 110, duration: "60 min", image: serviceImages.facial, category: "Facial" },
    { name: "Vitamin C Facial", price: 95, duration: "50 min", image: serviceImages.facial, category: "Facial" },
    { name: "Deep Tissue Massage", price: 140, duration: "90 min", image: serviceImages.massage, category: "Massage" },
    { name: "Thai Massage", price: 120, duration: "75 min", image: serviceImages.massage, category: "Massage" },
    { name: "Body Scrub & Wrap", price: 170, duration: "90 min", image: serviceImages.massage, category: "Spa" },
    { name: "Luxury Manicure", price: 55, duration: "40 min", image: serviceImages.nails, category: "Nails" },
    { name: "Luxury Pedicure", price: 65, duration: "50 min", image: serviceImages.nails, category: "Nails" },
    { name: "Organic Color", price: 130, duration: "90 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Scalp Detox", price: 75, duration: "40 min", image: serviceImages.massage, category: "Hair Treatment" }
  ],
  "8": [
    { name: "Trendy Cut", price: 55, duration: "30 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Undercut Design", price: 65, duration: "40 min", image: serviceImages.haircut, category: "Haircut" },
    { name: "Vivid Color", price: 150, duration: "120 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Pastel Tones", price: 170, duration: "150 min", image: serviceImages.hairColor, category: "Hair Color" },
    { name: "Creative Braids", price: 85, duration: "60 min", image: serviceImages.haircut, category: "Hair Styling" },
    { name: "Festival Makeup", price: 70, duration: "45 min", image: serviceImages.facialMakeup, category: "Make Up" },
    { name: "Nail Art", price: 65, duration: "60 min", image: serviceImages.nails, category: "Nails" },
    { name: "Express Facial", price: 55, duration: "30 min", image: serviceImages.facial, category: "Facial" },
    { name: "Head & Neck Massage", price: 50, duration: "25 min", image: serviceImages.massage, category: "Massage" }
  ]
};
var salonPackages = {
  "1": [
    { name: "Swiss Signature", price: 130, originalPrice: 170, services: ["Precision Haircut", "Blow Dry & Style", "Classic Facial"], image: serviceImages.haircut },
    { name: "Color & Care", price: 200, originalPrice: 255, services: ["Full Hair Color", "Deep Conditioning", "Relaxation Massage"], image: serviceImages.hairColor },
    { name: "Alpine Retreat", price: 300, originalPrice: 380, services: ["Balayage Highlights", "Gel Manicure", "Spa Pedicure", "Relaxation Massage"], image: serviceImages.massage }
  ],
  "2": [
    { name: "Quick Refresh", price: 110, originalPrice: 140, services: ["Women's Haircut", "Hydrating Facial", "Eyebrow Shaping"], image: serviceImages.haircut },
    { name: "Color Queen", price: 210, originalPrice: 260, services: ["Ombre Color", "Keratin Treatment"], image: serviceImages.hairColor },
    { name: "Total Makeover", price: 280, originalPrice: 350, services: ["Women's Haircut", "Evening Makeup", "Acrylic Nails", "Swedish Massage"], image: serviceImages.facialMakeup }
  ],
  "3": [
    { name: "Gentleman's Classic", price: 85, originalPrice: 110, services: ["Classic Haircut", "Hot Towel Shave", "Head Massage"], image: serviceImages.haircut },
    { name: "Sharp & Clean", price: 95, originalPrice: 120, services: ["Fade & Design", "Beard Trim", "Straight Razor Lineup"], image: serviceImages.haircut },
    { name: "Executive Grooming", price: 140, originalPrice: 175, services: ["Hair & Beard Combo", "Scalp Treatment", "Gray Blending"], image: serviceImages.hairColor }
  ],
  "4": [
    { name: "Royal Treatment", price: 280, originalPrice: 350, services: ["Luxury Haircut", "Diamond Facial", "Aromatherapy Massage"], image: serviceImages.facial },
    { name: "Gold Experience", price: 350, originalPrice: 430, services: ["Full Color & Gloss", "Gold Mask Treatment", "Deluxe Manicure"], image: serviceImages.hairColor },
    { name: "Ultimate Indulgence", price: 420, originalPrice: 530, services: ["Luxury Haircut", "Hot Stone Massage", "Lash Extensions", "Deluxe Pedicure"], image: serviceImages.massage }
  ],
  "5": [
    { name: "Quick Trim", price: 75, originalPrice: 95, services: ["Men's Haircut", "Beard Sculpting", "Scalp Massage"], image: serviceImages.haircut },
    { name: "Fresh Fade", price: 90, originalPrice: 115, services: ["Skin Fade", "Razor Shave", "Face Mask"], image: serviceImages.haircut },
    { name: "Style Master", price: 120, originalPrice: 150, services: ["Hair Design", "Color Camo", "Scalp Massage"], image: serviceImages.hairColor }
  ],
  "6": [
    { name: "Family Bundle", price: 60, originalPrice: 75, services: ["Family Haircut", "Children's Cut"], image: serviceImages.haircut },
    { name: "Pamper Day", price: 130, originalPrice: 165, services: ["Family Haircut", "Express Facial", "Classic Manicure", "Classic Pedicure"], image: serviceImages.facial },
    { name: "Full Glow Up", price: 190, originalPrice: 240, services: ["Highlights", "Quick Makeup", "Classic Manicure", "Back & Shoulder Massage"], image: serviceImages.hairColor }
  ],
  "7": [
    { name: "Zen Retreat", price: 240, originalPrice: 300, services: ["Anti-Aging Facial", "Deep Tissue Massage", "Scalp Detox"], image: serviceImages.massage },
    { name: "Beauty & Bliss", price: 190, originalPrice: 240, services: ["Signature Haircut", "Vitamin C Facial", "Luxury Manicure"], image: serviceImages.facial },
    { name: "Total Wellness", price: 400, originalPrice: 500, services: ["Thai Massage", "Body Scrub & Wrap", "Luxury Pedicure", "Organic Color"], image: serviceImages.massage }
  ],
  "8": [
    { name: "Street Style", price: 110, originalPrice: 140, services: ["Trendy Cut", "Undercut Design", "Head & Neck Massage"], image: serviceImages.haircut },
    { name: "Color Pop", price: 220, originalPrice: 280, services: ["Vivid Color", "Creative Braids", "Express Facial"], image: serviceImages.hairColor },
    { name: "Festival Ready", price: 270, originalPrice: 340, services: ["Pastel Tones", "Festival Makeup", "Nail Art"], image: serviceImages.facialMakeup }
  ]
};
var salonSpecialists = {
  "1": [
    { name: "Lukas Meier", role: "Senior Stylist", image: specialistImages[0], rating: 4.9 },
    { name: "Anna Keller", role: "Color Specialist", image: specialistImages[1], rating: 4.8 },
    { name: "Marc Huber", role: "Master Barber", image: specialistImages[2], rating: 4.9 },
    { name: "Sophie Brunner", role: "Nail Technician", image: specialistImages[3], rating: 4.7 },
    { name: "Thomas Widmer", role: "Massage Therapist", image: specialistImages[4], rating: 4.8 }
  ],
  "2": [
    { name: "Claire Dupont", role: "Lead Stylist", image: specialistImages[5], rating: 4.8 },
    { name: "Pierre Laurent", role: "Hair Colorist", image: specialistImages[0], rating: 4.7 },
    { name: "Isabelle Martin", role: "Esthetician", image: specialistImages[1], rating: 4.9 },
    { name: "Jean-Luc Bernard", role: "Makeup Artist", image: specialistImages[2], rating: 4.6 },
    { name: "Marie Favre", role: "Nail Artist", image: specialistImages[3], rating: 4.8 }
  ],
  "3": [
    { name: "Stefan Berger", role: "Master Barber", image: specialistImages[4], rating: 4.9 },
    { name: "Reto Schwarz", role: "Senior Barber", image: specialistImages[0], rating: 4.8 },
    { name: "Niklaus Fischer", role: "Fade Specialist", image: specialistImages[2], rating: 4.9 },
    { name: "Daniel Gerber", role: "Beard Expert", image: specialistImages[4], rating: 4.7 }
  ],
  "4": [
    { name: "Camille Blanc", role: "Luxury Stylist", image: specialistImages[5], rating: 4.9 },
    { name: "Philippe Rochat", role: "Spa Director", image: specialistImages[0], rating: 4.8 },
    { name: "Valentina Rossi", role: "Esthetician", image: specialistImages[1], rating: 4.9 },
    { name: "Nicolas Aubert", role: "Massage Specialist", image: specialistImages[2], rating: 4.7 },
    { name: "Elena Bianchi", role: "Lash Technician", image: specialistImages[3], rating: 4.8 }
  ],
  "5": [
    { name: "Maximilian Braun", role: "Head Barber", image: specialistImages[4], rating: 4.7 },
    { name: "Felix Wagner", role: "Fade Artist", image: specialistImages[0], rating: 4.6 },
    { name: "Tobias Schmidt", role: "Style Expert", image: specialistImages[2], rating: 4.5 },
    { name: "Markus Bauer", role: "Beard Specialist", image: specialistImages[4], rating: 4.8 }
  ],
  "6": [
    { name: "Elisabeth Gruber", role: "Family Stylist", image: specialistImages[5], rating: 4.8 },
    { name: "Franz Hofer", role: "Senior Barber", image: specialistImages[0], rating: 4.7 },
    { name: "Maria Steiner", role: "Children's Specialist", image: specialistImages[1], rating: 4.9 },
    { name: "Wolfgang Pichler", role: "Colorist", image: specialistImages[2], rating: 4.6 },
    { name: "Sabine Winkler", role: "Nail Technician", image: specialistImages[3], rating: 4.8 }
  ],
  "7": [
    { name: "Dr. Lena Roth", role: "Spa Therapist", image: specialistImages[5], rating: 4.9 },
    { name: "Oliver Schneider", role: "Senior Stylist", image: specialistImages[0], rating: 4.8 },
    { name: "Yuki Tanaka", role: "Massage Expert", image: specialistImages[1], rating: 4.9 },
    { name: "Andreas Frey", role: "Hair Colorist", image: specialistImages[2], rating: 4.7 },
    { name: "Katarina Novak", role: "Esthetician", image: specialistImages[3], rating: 4.9 }
  ],
  "8": [
    { name: "Lea Zimmermann", role: "Creative Director", image: specialistImages[5], rating: 4.6 },
    { name: "Patrick Mueller", role: "Color Innovator", image: specialistImages[0], rating: 4.5 },
    { name: "Nina Weber", role: "Braid Specialist", image: specialistImages[1], rating: 4.7 },
    { name: "Sandra Vogel", role: "Nail Artist", image: specialistImages[3], rating: 4.4 },
    { name: "Jan Kessler", role: "Trend Stylist", image: specialistImages[4], rating: 4.5 }
  ]
};
var salonReviews = {
  "1": [
    { userName: "Emma Hofmann", userImage: reviewerImages[0], rating: 5, comment: "Absolutely love Alpine Groom! My balayage turned out stunning and the team was so attentive.", date: "2 days ago" },
    { userName: "Michael Weber", userImage: reviewerImages[1], rating: 5, comment: "Best facial I have ever had. My skin is glowing! Will definitely be back.", date: "5 days ago" },
    { userName: "Robert Fischer", userImage: reviewerImages[2], rating: 4, comment: "Great haircut and very relaxing atmosphere. Swiss quality at its finest.", date: "1 week ago" },
    { userName: "Laura Schmid", userImage: reviewerImages[3], rating: 5, comment: "The hot towel shave was incredible. True craftmanship in every detail.", date: "2 weeks ago" },
    { userName: "David Schneider", userImage: reviewerImages[4], rating: 4, comment: "Clean salon, professional staff. The massage was incredibly relaxing.", date: "3 weeks ago" },
    { userName: "Jessica Mueller", userImage: reviewerImages[5], rating: 5, comment: "Sophie did an amazing job on my nails. So detailed and long-lasting!", date: "1 month ago" }
  ],
  "2": [
    { userName: "Marie Lefevre", userImage: reviewerImages[1], rating: 5, comment: "Claire is a genius with color! My ombre looks so natural and beautiful.", date: "1 day ago" },
    { userName: "Christian Favre", userImage: reviewerImages[2], rating: 4, comment: "Wonderful ambiance and friendly staff. The keratin treatment made my hair silky smooth.", date: "4 days ago" },
    { userName: "Nicole Perrin", userImage: reviewerImages[3], rating: 5, comment: "Brought my daughter for her first haircut here. They were so patient and sweet with her!", date: "1 week ago" },
    { userName: "Matthieu Blanc", userImage: reviewerImages[0], rating: 4, comment: "Solid haircut and good conversation. Excellent quality for the price.", date: "2 weeks ago" },
    { userName: "Laura Girard", userImage: reviewerImages[4], rating: 5, comment: "The Swedish massage melted all my stress away. Marie's nail work is art!", date: "3 weeks ago" }
  ],
  "3": [
    { userName: "Marco Bieri", userImage: reviewerImages[5], rating: 5, comment: "Best barbershop in Bern, hands down. Stefan gave me the cleanest fade I have ever had.", date: "3 days ago" },
    { userName: "Florian Keller", userImage: reviewerImages[0], rating: 5, comment: "The hot towel shave is an experience every man needs. Old-school quality at its finest.", date: "1 week ago" },
    { userName: "Peter Brunner", userImage: reviewerImages[2], rating: 5, comment: "Been coming here for years. Consistent, quality work every single time.", date: "2 weeks ago" },
    { userName: "Jonas Huber", userImage: reviewerImages[4], rating: 4, comment: "Great barbers but it can get crowded on weekends. Book ahead if you can.", date: "3 weeks ago" },
    { userName: "Kevin Frei", userImage: reviewerImages[1], rating: 5, comment: "Niklaus did an incredible design on my fade. Getting compliments everywhere!", date: "1 month ago" },
    { userName: "Samuel Wyss", userImage: reviewerImages[3], rating: 5, comment: "My go-to spot for a clean lineup. Professional and efficient every time.", date: "1 month ago" }
  ],
  "4": [
    { userName: "Victoria Rochat", userImage: reviewerImages[3], rating: 5, comment: "The Gold Mask Treatment was divine. My skin feels 10 years younger!", date: "2 days ago" },
    { userName: "Catherine Morel", userImage: reviewerImages[1], rating: 5, comment: "Hot stone massage was absolutely heavenly. The lakeside ambiance is so luxurious.", date: "5 days ago" },
    { userName: "Richard Bonvin", userImage: reviewerImages[2], rating: 4, comment: "Premium experience with premium prices. You get what you pay for here.", date: "1 week ago" },
    { userName: "Diana Favre", userImage: reviewerImages[4], rating: 5, comment: "Camille is the best stylist I have ever had. She understands exactly what I want.", date: "2 weeks ago" },
    { userName: "William Aubert", userImage: reviewerImages[0], rating: 4, comment: "Excellent service and beautiful space. Lash extensions look very natural.", date: "1 month ago" }
  ],
  "5": [
    { userName: "Jakob Hoffmann", userImage: reviewerImages[0], rating: 5, comment: "Maximilian gives the best fades in Munich. Quick, clean, and reliable.", date: "1 day ago" },
    { userName: "Tobias Richter", userImage: reviewerImages[2], rating: 4, comment: "Good barbershop with a cool modern vibe. The face mask was a nice touch.", date: "3 days ago" },
    { userName: "Erik Becker", userImage: reviewerImages[5], rating: 5, comment: "Been to many barbers but Munich Edge is something special. Highly recommend!", date: "1 week ago" },
    { userName: "Niklas Lang", userImage: reviewerImages[4], rating: 4, comment: "Solid haircut at a fair price. The guys here really know their craft.", date: "2 weeks ago" },
    { userName: "Alexander Wolf", userImage: reviewerImages[1], rating: 4, comment: "My beard has never looked this good. Markus is a true beard specialist.", date: "3 weeks ago" },
    { userName: "Benjamin Klein", userImage: reviewerImages[3], rating: 5, comment: "Tobias gave me exactly the style I wanted. Great attention to detail.", date: "1 month ago" }
  ],
  "6": [
    { userName: "Angela Huber", userImage: reviewerImages[3], rating: 5, comment: "We bring the whole family here! Elisabeth is wonderful with the kids.", date: "2 days ago" },
    { userName: "Patricia Gruber", userImage: reviewerImages[1], rating: 5, comment: "Affordable and high quality. My highlights look amazing! Best value in Vienna.", date: "4 days ago" },
    { userName: "Thomas Berger", userImage: reviewerImages[0], rating: 4, comment: "Good neighborhood salon. Franz always gives me a great cut.", date: "1 week ago" },
    { userName: "Linda Pichler", userImage: reviewerImages[4], rating: 5, comment: "Maria is the best with children's haircuts. My toddler actually enjoyed it!", date: "2 weeks ago" },
    { userName: "Georg Moser", userImage: reviewerImages[2], rating: 4, comment: "Friendly staff and clean shop. The back massage was a nice surprise bonus.", date: "3 weeks ago" },
    { userName: "Rosa Bauer", userImage: reviewerImages[5], rating: 5, comment: "Love this place! The whole family leaves happy every single visit.", date: "1 month ago" }
  ],
  "7": [
    { userName: "Sophia Keller", userImage: reviewerImages[4], rating: 5, comment: "The deep tissue massage was transformative. Dr. Roth has healing hands.", date: "1 day ago" },
    { userName: "Olivia Brandt", userImage: reviewerImages[1], rating: 5, comment: "Best spa experience in Basel! The body scrub and wrap left me feeling reborn.", date: "3 days ago" },
    { userName: "Emma Weber", userImage: reviewerImages[3], rating: 5, comment: "The anti-aging facial is worth every penny. Visible results after just one session!", date: "1 week ago" },
    { userName: "James Foster", userImage: reviewerImages[0], rating: 4, comment: "Oliver gave me an excellent haircut. The whole spa atmosphere is very calming.", date: "2 weeks ago" },
    { userName: "Rachel Maurer", userImage: reviewerImages[5], rating: 5, comment: "Yuki's Thai massage is absolutely incredible. I come back every month now.", date: "3 weeks ago" },
    { userName: "Daniel Schafer", userImage: reviewerImages[2], rating: 5, comment: "Organic color turned out beautifully. Katarina's facials are magical too.", date: "1 month ago" }
  ],
  "8": [
    { userName: "Megan Ritter", userImage: reviewerImages[4], rating: 5, comment: "Lea is a creative genius! My vivid purple turned out insanely good.", date: "1 day ago" },
    { userName: "Sarah Graf", userImage: reviewerImages[1], rating: 4, comment: "Trendy salon with great energy. The undercut design was exactly what I wanted.", date: "3 days ago" },
    { userName: "Taylor Kuhn", userImage: reviewerImages[3], rating: 4, comment: "Love the vibe here. Pastel tones came out perfectly. A bit pricey though.", date: "1 week ago" },
    { userName: "Jordan Lenz", userImage: reviewerImages[0], rating: 5, comment: "Nina's braids are absolute works of art. Got so many compliments!", date: "2 weeks ago" },
    { userName: "Chris Ernst", userImage: reviewerImages[2], rating: 4, comment: "Cool spot with talented stylists. Nail art by Sandra was stunning.", date: "3 weeks ago" },
    { userName: "Morgan Baumann", userImage: reviewerImages[5], rating: 4, comment: "Great atmosphere and music. Jan nailed the trendy cut I was going for.", date: "1 month ago" }
  ]
};
async function seedDatabase() {
  if (process.env.FORCE_SEED !== "true") {
    const existingSalons = await db.select().from(salons).limit(1);
    if (existingSalons.length > 0) {
      console.log("Database already contains data, skipping seed. Use FORCE_SEED=true to override.");
      return;
    }
  }
  console.log("Seeding database with European/Swiss data...");
  await db.delete(tips);
  await db.delete(customerNotes);
  await db.delete(loyaltyTransactions);
  await db.delete(commissions);
  await db.delete(shifts);
  await db.delete(inventory);
  await db.delete(expenses);
  await db.delete(activityLogs);
  await db.delete(subscriptions);
  await db.delete(licenseKeys);
  await db.delete(salonStaff);
  await db.delete(bookings);
  await db.delete(messages);
  await db.delete(notifications);
  await db.delete(coupons);
  await db.delete(reviews);
  await db.delete(specialists);
  await db.delete(packages);
  await db.delete(services);
  await db.delete(salons);
  await db.delete(plans);
  await db.delete(users);
  const bcrypt = require("bcryptjs");
  const adminPassword = await bcrypt.hash("admin123", 10);
  const demoPassword = await bcrypt.hash("demo123", 10);
  await db.insert(users).values([
    {
      id: "00000000-0000-0000-0000-000000000000",
      fullName: "Platform Admin",
      email: "admin@barber.com",
      password: adminPassword,
      role: "super_admin",
      phone: "+41 44 000 0001",
      loyaltyPoints: 1e3,
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
    },
    {
      id: "00000000-0000-0000-0000-000000000001",
      fullName: "Lukas Meier",
      email: "lukas@alpinegroom.ch",
      password: demoPassword,
      role: "salon_admin",
      phone: "+41 44 123 4567",
      avatar: specialistImages[0]
    },
    {
      id: "00000000-0000-0000-0000-000000000002",
      fullName: "Claire Dupont",
      email: "claire@genevaelegance.ch",
      password: demoPassword,
      role: "salon_admin",
      phone: "+41 22 765 4321",
      avatar: specialistImages[5]
    },
    {
      id: "00000000-0000-0000-0000-000000000003",
      fullName: "Stefan Berger",
      email: "stefan@bernclassic.ch",
      password: demoPassword,
      role: "salon_admin",
      phone: "+41 31 890 1234",
      avatar: specialistImages[4]
    },
    {
      id: "00000000-0000-0000-0000-000000000010",
      fullName: "Emma Hofmann",
      email: "emma@example.com",
      password: demoPassword,
      role: "user",
      phone: "+41 78 111 2233",
      avatar: reviewerImages[0],
      loyaltyPoints: 250
    },
    {
      id: "00000000-0000-0000-0000-000000000011",
      fullName: "Michael Weber",
      email: "michael@example.com",
      password: demoPassword,
      role: "user",
      phone: "+41 79 222 3344",
      avatar: reviewerImages[1],
      loyaltyPoints: 180
    },
    {
      id: "00000000-0000-0000-0000-000000000012",
      fullName: "Robert Fischer",
      email: "robert@example.com",
      password: demoPassword,
      role: "user",
      phone: "+49 170 333 4455",
      avatar: reviewerImages[2],
      loyaltyPoints: 420
    },
    {
      id: "00000000-0000-0000-0000-000000000020",
      fullName: "Marc Huber",
      email: "marc@alpinegroom.ch",
      password: demoPassword,
      role: "staff",
      phone: "+41 44 123 4568",
      avatar: specialistImages[2]
    },
    {
      id: "00000000-0000-0000-0000-000000000021",
      fullName: "Anna Keller",
      email: "anna@alpinegroom.ch",
      password: demoPassword,
      role: "staff",
      phone: "+41 44 123 4569",
      avatar: specialistImages[1]
    }
  ]);
  await db.insert(salons).values(salonData.map((s) => ({
    ...s,
    ownerId: s.id === "1" ? "00000000-0000-0000-0000-000000000001" : s.id === "2" ? "00000000-0000-0000-0000-000000000002" : s.id === "3" ? "00000000-0000-0000-0000-000000000003" : ""
  })));
  await db.insert(salonStaff).values([
    { userId: "00000000-0000-0000-0000-000000000001", salonId: "1", role: "salon_admin" },
    { userId: "00000000-0000-0000-0000-000000000020", salonId: "1", role: "staff" },
    { userId: "00000000-0000-0000-0000-000000000021", salonId: "1", role: "staff" },
    { userId: "00000000-0000-0000-0000-000000000002", salonId: "2", role: "salon_admin" },
    { userId: "00000000-0000-0000-0000-000000000003", salonId: "3", role: "salon_admin" }
  ]);
  await db.insert(plans).values([
    {
      id: "plan-basic",
      name: "Basic",
      price: 29,
      billingCycle: "monthly",
      features: ["Up to 50 bookings per month", "Basic analytics", "Email support", "1 staff member"],
      commissionRate: 8,
      maxBookings: 50,
      maxStaff: 1,
      isActive: true
    },
    {
      id: "plan-pro",
      name: "Pro",
      price: 79,
      billingCycle: "monthly",
      features: ["Unlimited bookings", "Advanced analytics", "Priority support", "Up to 5 staff", "Custom landing page", "Inventory management"],
      commissionRate: 5,
      maxBookings: 0,
      maxStaff: 5,
      isActive: true
    },
    {
      id: "plan-enterprise",
      name: "Enterprise",
      price: 149,
      billingCycle: "monthly",
      features: ["Unlimited everything", "Dedicated account manager", "API access", "White-label options", "Custom integrations", "Multi-location support"],
      commissionRate: 3,
      maxBookings: 0,
      maxStaff: 0,
      isActive: true
    }
  ]);
  await db.insert(subscriptions).values([
    { salonId: "1", planId: "plan-pro", status: "active", startDate: "2025-01-01", endDate: "2026-01-01" },
    { salonId: "2", planId: "plan-enterprise", status: "active", startDate: "2025-02-01", endDate: "2026-02-01" },
    { salonId: "3", planId: "plan-basic", status: "active", startDate: "2025-03-01", endDate: "2026-03-01" },
    { salonId: "4", planId: "plan-pro", status: "active", startDate: "2025-01-15", endDate: "2026-01-15" },
    { salonId: "5", planId: "plan-basic", status: "active", startDate: "2025-04-01", endDate: "2026-04-01" },
    { salonId: "6", planId: "plan-pro", status: "active", startDate: "2025-02-15", endDate: "2026-02-15" },
    { salonId: "7", planId: "plan-enterprise", status: "active", startDate: "2025-01-01", endDate: "2026-01-01" },
    { salonId: "8", planId: "plan-basic", status: "active", startDate: "2025-05-01", endDate: "2026-05-01" }
  ]);
  await db.insert(licenseKeys).values([
    { key: "ALPINE-GROOM-2025-XXXX", salonId: "1", planId: "plan-pro", status: "active", expiresAt: "2026-01-01", maxActivations: 3, activationCount: 1 },
    { key: "GENEVA-ELEG-2025-XXXX", salonId: "2", planId: "plan-enterprise", status: "active", expiresAt: "2026-02-01", maxActivations: 5, activationCount: 2 },
    { key: "BERN-CLASSIC-2025-XXXX", salonId: "3", planId: "plan-basic", status: "active", expiresAt: "2026-03-01", maxActivations: 1, activationCount: 1 },
    { key: "DEMO-FREE-TRIAL-2025", salonId: "", planId: "", status: "unused", expiresAt: "2026-12-31", maxActivations: 0, activationCount: 0 }
  ]);
  for (const salon of salonData) {
    const sId = salon.id;
    const svcData = salonServices[sId];
    if (svcData) {
      await db.insert(services).values(
        svcData.map((s, i) => ({ id: `${sId}_s${i + 1}`, salonId: sId, ...s }))
      );
    }
    const pkgData = salonPackages[sId];
    if (pkgData) {
      await db.insert(packages).values(
        pkgData.map((p, i) => ({ id: `${sId}_p${i + 1}`, salonId: sId, ...p }))
      );
    }
    const specData = salonSpecialists[sId];
    if (specData) {
      await db.insert(specialists).values(
        specData.map((sp, i) => ({ id: `${sId}_sp${i + 1}`, salonId: sId, ...sp }))
      );
    }
    const revData = salonReviews[sId];
    if (revData) {
      await db.insert(reviews).values(
        revData.map((r, i) => ({ id: `${sId}_r${i + 1}`, salonId: sId, ...r }))
      );
    }
  }
  await db.insert(coupons).values([
    { code: "WELCOME10", discount: 10, type: "percentage", expiryDate: "2026-12-31", usageLimit: 100, active: true },
    { code: "SWISS20", discount: 20, type: "percentage", expiryDate: "2026-06-30", usageLimit: 50, active: true },
    { code: "SAVE15", discount: 15, type: "fixed", expiryDate: "2026-09-30", usageLimit: 200, active: true },
    { code: "SUMMER25", discount: 25, type: "percentage", expiryDate: "2026-08-31", usageLimit: 100, active: true }
  ]);
  await db.insert(messages).values([
    { userId: "00000000-0000-0000-0000-000000000010", salonId: "1", salonName: "Alpine Groom", content: "Hello, I would like to confirm my appointment for Saturday.", sender: "user" },
    { userId: "00000000-0000-0000-0000-000000000010", salonId: "1", salonName: "Alpine Groom", content: "Of course! Your appointment on Saturday at 10:00 AM is confirmed. See you then!", sender: "salon" },
    { userId: "00000000-0000-0000-0000-000000000011", salonId: "2", salonName: "Geneva Elegance", content: "Do you offer keratin treatment for men?", sender: "user" },
    { userId: "00000000-0000-0000-0000-000000000011", salonId: "2", salonName: "Geneva Elegance", content: "Absolutely! Our keratin treatment works great for all hair types. Would you like to book?", sender: "salon" },
    { userId: "00000000-0000-0000-0000-000000000012", salonId: "3", salonName: "Bern Classic Barbers", content: "What are your available slots for tomorrow?", sender: "user" },
    { userId: "00000000-0000-0000-0000-000000000012", salonId: "3", salonName: "Bern Classic Barbers", content: "We have openings at 11:00 AM, 2:00 PM, and 4:30 PM. Which works best for you?", sender: "salon" }
  ]);
  await db.insert(notifications).values([
    { userId: "00000000-0000-0000-0000-000000000010", title: "Booking Confirmed", message: "Your appointment at Alpine Groom on Saturday at 10:00 AM has been confirmed.", type: "booking", read: false },
    { userId: "00000000-0000-0000-0000-000000000010", title: "Welcome Bonus", message: "You have earned 50 loyalty points as a welcome bonus! Use them on your next visit.", type: "loyalty", read: true },
    { userId: "00000000-0000-0000-0000-000000000011", title: "Special Offer", message: "Get 20% off your next visit to Geneva Elegance with code SWISS20.", type: "promotion", read: false },
    { userId: "00000000-0000-0000-0000-000000000012", title: "Review Reminder", message: "How was your visit to Bern Classic Barbers? Leave a review and earn 10 loyalty points.", type: "system", read: false }
  ]);
  await db.insert(bookings).values([
    {
      userId: "00000000-0000-0000-0000-000000000010",
      salonId: "1",
      salonName: "Alpine Groom",
      salonImage: salonHeroImages[0],
      services: ["Precision Haircut", "Hot Towel Shave"],
      date: "2025-12-15",
      time: "10:00 AM",
      totalPrice: 100,
      status: "completed",
      paymentMethod: "card",
      specialistId: "1_sp1"
    },
    {
      userId: "00000000-0000-0000-0000-000000000010",
      salonId: "1",
      salonName: "Alpine Groom",
      salonImage: salonHeroImages[0],
      services: ["Relaxation Massage"],
      date: "2026-01-10",
      time: "2:00 PM",
      totalPrice: 95,
      status: "completed",
      paymentMethod: "card",
      specialistId: "1_sp5"
    },
    {
      userId: "00000000-0000-0000-0000-000000000011",
      salonId: "2",
      salonName: "Geneva Elegance",
      salonImage: salonHeroImages[1],
      services: ["Women's Haircut", "Hydrating Facial"],
      date: "2026-02-05",
      time: "11:00 AM",
      totalPrice: 145,
      status: "completed",
      paymentMethod: "cash",
      specialistId: "2_sp1"
    },
    {
      userId: "00000000-0000-0000-0000-000000000012",
      salonId: "3",
      salonName: "Bern Classic Barbers",
      salonImage: salonHeroImages[2],
      services: ["Classic Haircut", "Beard Trim"],
      date: "2026-03-01",
      time: "9:30 AM",
      totalPrice: 70,
      status: "completed",
      paymentMethod: "card",
      specialistId: "3_sp1"
    },
    {
      userId: "00000000-0000-0000-0000-000000000010",
      salonId: "4",
      salonName: "Lausanne Luxe Spa",
      salonImage: salonHeroImages[3],
      services: ["Diamond Facial", "Hot Stone Massage"],
      date: "2026-03-20",
      time: "1:00 PM",
      totalPrice: 290,
      status: "completed",
      paymentMethod: "card",
      specialistId: "4_sp3"
    },
    {
      userId: "00000000-0000-0000-0000-000000000011",
      salonId: "5",
      salonName: "Munich Edge Studio",
      salonImage: salonHeroImages[5],
      services: ["Men's Haircut", "Skin Fade"],
      date: "2026-04-05",
      time: "3:00 PM",
      totalPrice: 95,
      status: "pending",
      paymentMethod: "card",
      specialistId: "5_sp1"
    },
    {
      userId: "00000000-0000-0000-0000-000000000012",
      salonId: "6",
      salonName: "Vienna Heritage Salon",
      salonImage: salonHeroImages[6],
      services: ["Family Haircut", "Children's Cut"],
      date: "2026-04-10",
      time: "10:00 AM",
      totalPrice: 68,
      status: "upcoming",
      paymentMethod: "cash",
      specialistId: "6_sp1"
    },
    {
      userId: "00000000-0000-0000-0000-000000000010",
      salonId: "7",
      salonName: "Basel Wellness Studio",
      salonImage: salonHeroImages[4],
      services: ["Deep Tissue Massage", "Anti-Aging Facial"],
      date: "2026-04-15",
      time: "11:00 AM",
      totalPrice: 250,
      status: "upcoming",
      paymentMethod: "card",
      specialistId: "7_sp1"
    },
    {
      userId: "00000000-0000-0000-0000-000000000011",
      salonId: "1",
      salonName: "Alpine Groom",
      salonImage: salonHeroImages[0],
      services: ["Full Hair Color"],
      date: "2026-02-20",
      time: "2:00 PM",
      totalPrice: 120,
      status: "cancelled",
      paymentMethod: "card",
      specialistId: "1_sp2"
    },
    {
      userId: "00000000-0000-0000-0000-000000000012",
      salonId: "8",
      salonName: "Lucerne Style House",
      salonImage: salonHeroImages[7],
      services: ["Vivid Color", "Express Facial"],
      date: "2026-03-10",
      time: "4:00 PM",
      totalPrice: 205,
      status: "completed",
      paymentMethod: "card",
      specialistId: "8_sp1"
    }
  ]);
  await db.insert(inventory).values([
    { salonId: "1", name: "Professional Scissors Set", category: "tools", quantity: 8, minQuantity: 3, unit: "pcs", price: 120 },
    { salonId: "1", name: "Hair Clipper Blades", category: "tools", quantity: 15, minQuantity: 5, unit: "pcs", price: 25 },
    { salonId: "1", name: "Shampoo (Professional)", category: "products", quantity: 24, minQuantity: 10, unit: "bottles", price: 18 },
    { salonId: "1", name: "Conditioner (Professional)", category: "products", quantity: 20, minQuantity: 10, unit: "bottles", price: 22 },
    { salonId: "1", name: "Hair Color Tubes", category: "supplies", quantity: 45, minQuantity: 15, unit: "tubes", price: 12 },
    { salonId: "1", name: "Disposable Towels", category: "supplies", quantity: 200, minQuantity: 50, unit: "pcs", price: 0.5 },
    { salonId: "1", name: "Styling Gel", category: "products", quantity: 30, minQuantity: 10, unit: "jars", price: 15 },
    { salonId: "1", name: "Straight Razors", category: "tools", quantity: 6, minQuantity: 2, unit: "pcs", price: 85 }
  ]);
  await db.insert(expenses).values([
    { salonId: "1", description: "Monthly rent - Bahnhofstrasse location", amount: 4500, category: "rent", date: "2026-03-01" },
    { salonId: "1", description: "Electricity and water utilities", amount: 380, category: "utilities", date: "2026-03-01" },
    { salonId: "1", description: "Hair product restocking from supplier", amount: 850, category: "supplies", date: "2026-03-05" },
    { salonId: "1", description: "Staff salaries - March", amount: 8200, category: "salaries", date: "2026-03-15" },
    { salonId: "1", description: "Equipment maintenance and repair", amount: 250, category: "general", date: "2026-03-10" },
    { salonId: "1", description: "Monthly rent - Bahnhofstrasse location", amount: 4500, category: "rent", date: "2026-02-01" },
    { salonId: "1", description: "Staff salaries - February", amount: 8200, category: "salaries", date: "2026-02-15" },
    { salonId: "1", description: "Marketing and advertising", amount: 600, category: "general", date: "2026-02-20" }
  ]);
  const staffIds = ["00000000-0000-0000-0000-000000000020", "00000000-0000-0000-0000-000000000021"];
  const shiftEntries = [];
  for (const staffId of staffIds) {
    for (let day = 1; day <= 5; day++) {
      shiftEntries.push({ salonId: "1", staffId, dayOfWeek: day, startTime: "09:00", endTime: "17:00" });
    }
    shiftEntries.push({ salonId: "1", staffId, dayOfWeek: 6, startTime: "10:00", endTime: "15:00" });
  }
  await db.insert(shifts).values(shiftEntries);
  await db.insert(commissions).values([
    { bookingId: "booking-1", salonId: "1", amount: 5, rate: 5, status: "paid" },
    { bookingId: "booking-2", salonId: "1", amount: 4.75, rate: 5, status: "paid" },
    { bookingId: "booking-3", salonId: "2", amount: 4.35, rate: 3, status: "paid" },
    { bookingId: "booking-4", salonId: "3", amount: 5.6, rate: 8, status: "pending" },
    { bookingId: "booking-5", salonId: "4", amount: 14.5, rate: 5, status: "pending" }
  ]);
  await db.insert(appSettings).values([
    { key: "platform_name", value: "Barmagly", description: "Platform display name" },
    { key: "platform_currency", value: "CHF", description: "Default currency" },
    { key: "default_commission_rate", value: "5", description: "Default platform commission percentage" },
    { key: "booking_advance_days", value: "30", description: "Max days in advance for bookings" },
    { key: "loyalty_points_per_booking", value: "10", description: "Loyalty points earned per completed booking" },
    { key: "maintenance_mode", value: "false", description: "Enable maintenance mode" }
  ]);
  await db.insert(activityLogs).values([
    { userId: "00000000-0000-0000-0000-000000000000", userRole: "super_admin", action: "platform.seed", entityType: "system", entityId: "", metadata: { message: "Database seeded with European/Swiss data" } },
    { userId: "00000000-0000-0000-0000-000000000001", userRole: "salon_admin", action: "salon.login", entityType: "salon", entityId: "1", metadata: { salonName: "Alpine Groom" } },
    { userId: "00000000-0000-0000-0000-000000000010", userRole: "user", action: "booking.created", entityType: "booking", entityId: "booking-1", metadata: { salonName: "Alpine Groom", services: ["Precision Haircut"] } },
    { userId: "00000000-0000-0000-0000-000000000010", userRole: "user", action: "booking.completed", entityType: "booking", entityId: "booking-1", metadata: { salonName: "Alpine Groom" } },
    { userId: "00000000-0000-0000-0000-000000000011", userRole: "user", action: "user.registered", entityType: "user", entityId: "00000000-0000-0000-0000-000000000011", metadata: { source: "web" } }
  ]);
  console.log("Database seeded successfully with European/Swiss data!");
}

// server/run-seed.ts
async function main() {
  try {
    process.env.FORCE_SEED = "true";
    await seedDatabase();
    console.log("Seed complete.");
  } catch (err) {
    console.error("Seed failed:", err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}
main();
