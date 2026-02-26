import { Card, Skeleton } from "antd";

const Loading = () => (
  <Card>
    <Skeleton active paragraph={{ rows: 6 }} />
  </Card>
);

export default Loading;
