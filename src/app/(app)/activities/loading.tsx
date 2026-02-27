import { Spin } from "antd";

const Loading = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
    <Spin tip="Loading activities..." size="large" />
  </div>
);

export default Loading;
