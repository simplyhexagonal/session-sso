var __defProp = Object.defineProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
__export(exports, {
  default: () => SSOUtils
});
class SSOUtils {
}
SSOUtils.normalizeServerResponse = (res) => {
  if (res.status === 200) {
    return res.data;
  } else {
    throw new Error(`${res.status} ${res.statusText} ${res.data}`);
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {});
//# sourceMappingURL=index.js.map
'undefined'!=typeof module&&(module.exports=SSOUtils.default),'undefined'!=typeof window&&(SSOUtils=SSOUtils.default);