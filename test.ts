import axios from "axios";
import iconv from "iconv-lite";

async function test() {
  try {
    const response = await axios.get("http://qt.gtimg.cn/q=bj920000", { responseType: 'arraybuffer' });
    const data = iconv.decode(response.data, 'gbk');
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}

test();
