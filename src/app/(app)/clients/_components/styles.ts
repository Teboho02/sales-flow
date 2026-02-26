import { createStyles, css } from "antd-style";

export const useStyles = createStyles(({ token }) => ({
  tableCard: css`
    border: 1px solid ${token.colorBorderSecondary};
    border-radius: 12px;
    overflow: hidden;
    background: ${token.colorBgContainer};
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.04);
  `,
  header: css`
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: ${token.colorBgLayout};
    border-bottom: 1px solid ${token.colorBorderSecondary};
  `,
  filters: css`
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    padding: 12px 20px;
    background: ${token.colorBgContainer};
    border-bottom: 1px solid ${token.colorBorderSecondary};
  `,
  tableWrapper: css`
    padding: 12px 20px 20px;
    background: ${token.colorBgContainer};
  `,
}));
