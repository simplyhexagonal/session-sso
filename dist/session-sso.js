var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
__export(exports, {
  default: () => src_default
});
var import_google = __toModule(require("./providers/google"));
var import_facebook = __toModule(require("./providers/facebook"));
var import_github = __toModule(require("./providers/github"));
var import_custom = __toModule(require("./providers/custom"));
var import_custom2 = __toModule(require("./generators/custom"));
const ssoProviders = {
  google: import_google.default,
  facebook: import_facebook.default,
  github: import_github.default,
  custom: import_custom.default
};
const ssoGenerators = {
  custom: import_custom2.default
};
class SessionSSO {
  constructor({
    defaultProvider,
    defaultGenerator,
    ...providerSpecificOptions
  } = {}) {
    this.generateSSO = async ({
      generator = this.defaultGenerator,
      authorizationPromise,
      privateKeyPromise
    }) => {
      if (generator === "custom" && !(authorizationPromise && privateKeyPromise)) {
        throw new Error("cannot perform custom sso without auth and private key promises");
      }
      return ssoGenerators[generator]({
        authorizationPromise,
        privateKeyPromise
      });
    };
    this.verifySSO = async ({
      provider = this.defaultProvider,
      authKey,
      retrieveProperties,
      ...providerSpecificOptions
    }) => {
      if (provider === "custom" && !providerSpecificOptions.publicKeyPromise) {
        throw new Error("cannot perform custom sso without a public key");
      }
      return await ssoProviders[provider]({
        authKey,
        retrieveProperties,
        ...this.providerSpecificOptions,
        ...providerSpecificOptions
      });
    };
    this.defaultProvider = defaultProvider || "custom";
    this.defaultGenerator = defaultGenerator || "custom";
    this.providerSpecificOptions = providerSpecificOptions;
  }
}
var src_default = SessionSSO;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=session-sso.js.map
'undefined'!=typeof module&&(module.exports=SessionSSO),'undefined'!=typeof window&&(SessionSSO=SessionSSO);
// 1.0.0
