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
  default: () => facebook_default
});
var import_axios = __toModule(require("axios"));
var import_utils = __toModule(require("../../utils"));
var facebook_default = ({
  appId,
  appSecret,
  authKey: token,
  retrieveProperties = ["email"]
}) => {
  return new Promise((resolve, reject) => {
    try {
      if (!(appId && appSecret)) {
        throw new Error("missing dev credentials");
      }
      import_axios.default.get(`https://graph.facebook.com/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&grant_type=client_credentials`).then(import_utils.default.normalizeServerResponse).then(({ access_token: apiToken }) => {
        if (!apiToken) {
          throw new Error("unable to fetch access_token");
        }
        import_axios.default.get(`https://graph.facebook.com/debug_token?input_token=${token}&access_token=${apiToken}`).then(import_utils.default.normalizeServerResponse).then(({ data }) => {
          const {
            is_valid: isValid
          } = data;
          if (!isValid) {
            throw new Error("token invalid");
          }
          const {
            user_id: userId
          } = data;
          import_axios.default.get(`https://graph.facebook.com/${userId}?fields=id,email&access_token=${token}`).then(import_utils.default.normalizeServerResponse).then((authPayload) => {
            if (!retrieveProperties.reduce((a, b) => a && Object.keys(authPayload).includes(b), true)) {
              throw new Error("properties missing in auth payload");
            }
            const payload = retrieveProperties.reduce((a, b) => {
              a[b] = authPayload[b];
              return a;
            }, {});
            resolve(payload);
          }).catch((e) => {
            reject(e.message);
          });
        }).catch((e) => {
          reject(e.message);
        });
      }).catch((e) => {
        reject(e.message);
      });
    } catch (e) {
      reject(e.message);
    }
  }).then((payload) => ({ payload })).catch((error) => ({ error }));
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=index.js.map
