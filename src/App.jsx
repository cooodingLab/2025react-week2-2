// 主線任務二
import { useState } from 'react';
import axios from "axios";
import "./assets/style.css";

// API 設定
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function App() {
  // 表單資料狀態(儲存登入表單輸入)
  const [formData, setFormData] = useState({
    username:"",
    password:"",
  });
  // 登入狀態管理(控制顯示登入或產品頁）
  const [isAuth, setIsAuth] = useState(false);
  // 產品資料狀態
  const [products, setProducts] = useState([]);
  // 目前選中的產品
  const [tempProduct, setTempProduct] = useState();
  
  // 表單輸入處理
  const handleInputChange = (e) => {
    const {name, value} = e.target
    setFormData((preData) => ({
      ...preData,
      [name]:value,
    }));
  };

  // 取得產品資料
  const getProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(response.data.products);
    } catch (error) {
      alert("存取失敗：" + (error.response?.data?.message || "請檢查 API 是否有誤"));
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // 登入提交處理
      const response = await axios.post(`${API_BASE}/admin/signin`, formData);
      const {token, expired} = response.data;

      // 設定 Cookie/儲存 Token 到 Cookie
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      // 設定 axios 預設 header
      axios.defaults.headers.common['Authorization'] = token;

      // 載入產品資料
      getProducts();

      // 更新登入狀態
      setIsAuth(true);
      alert("登入成功！");
      
    } catch (error) {
      setIsAuth(false);
      alert("登入失敗：" + (error.response?.data?.message || "請檢查帳密"));
    }
  }

  // 檢查登入狀態
  const checkLogin = async () => {
    try {
      // 讀取 Cookie/從 Cookie 取得 Token
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("hexToken="))
        ?.split("=")[1];
      // 修改實體建立時所指派的預設配置
      axios.defaults.headers.common['Authorization'] = token;
      // 驗證 Token 是否有效
      const response = await axios.post(`${API_BASE}/api/user/check`);
      console.log(response.data);

    } catch (error) {
      alert("尚未登入：" + (error.response?.data?.message || "請先登入"));
    }
  }

  return (
    <>
    {!isAuth ? (   
    <div className="container login">
      <h1>請先登入</h1>
      <form className="form-floating" onSubmit={onSubmit}>
        <div className="form-floating mb-3">
            <input type="email" 
                   className="form-control" 
                   name="username" 
                   placeholder="name@example.com" 
                   value={formData.username} 
                   onChange={handleInputChange}/>
            <label htmlFor="username">Email address</label>
          </div>
          <div className="form-floating">
            <input type="password" name="password" className="form-control" id="password" placeholder="Password" value={formData.password} onChange={handleInputChange}/>
            <label htmlFor="password">Password</label>
          </div>
          <button type='submit' className="btn btn-primary w-100 mt-2">
            登入
          </button>
      </form>

    </div>) : (
        <div className='container'>
          <div className="row mt-2">
            <div className="col-md-6">
              <button
                className="btn btn-danger mb-5"
                type="button"
                onClick={checkLogin}
              >
                確認是否登入
              </button>

              <h2 className="">產品列表</h2>
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">產品名稱</th>
                    <th scope="col">原價</th>
                    <th scope="col">售價</th>
                    <th scope="col">是否啟用</th>
                    <th scope="col">查看細節</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id}>
                      <th scope="row">{product.title}</th>
                      <td>{product.origin_price}</td>
                      <td>{product.price}</td>
                      <td>{product.is_enabled ? "啟用" : "未啟用"}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={() => setTempProduct(product)}
                        >
                          查看
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2 className="">產品明細</h2>
              {tempProduct ? (
                <div className="card">
                  <img
                    src={tempProduct.imageUrl}
                    className="card-img-top"
                    style={{ height: "300px" }}
                    alt="產品主圖"
                  />
                  <div className="card-body">
                    <h5 className="card-title">{tempProduct.title}</h5>
                    <p className="card-text">商品描述：{tempProduct.description}</p>
                    <p className="card-text">商品內容：{tempProduct.content}</p>
                    <div className="d-flex mb-3">
                      <p className="card-text text-secondary">
                        <del>{tempProduct.origin_price}</del>元 /{" "}
                        {tempProduct.price} 元
                      </p>
                    </div>
                    <h5 className="card-title">更多圖片</h5>
                    <div className="d-flex flex-wrap">
                      {tempProduct.imagesUrl.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          style={{ height: "100px",marginRight:'8px' }}
                          alt="產品系列圖"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p>請選擇產品</p>
              )}
            </div>
          </div>
        </div>
      )
    }
    </>


  );
}

export default App

