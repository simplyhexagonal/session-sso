export default class SSOUtils {
  static normalizeServerResponse = (res: any) => {
    // console.log(res);
    if (res.status === 200) {
      return res.data;
    } else {
      throw new Error(`${res.status} ${res.statusText} ${res.data}`);
    }
  }
}
