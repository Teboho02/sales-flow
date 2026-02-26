import { createStyles, css } from "antd-style";

export const useStyles = createStyles(() => ({
  page: css`
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  header: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  `,
  headerText: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,
  filterBar: css`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  `,
  card: css`
    border-radius: 12px;
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.05);
  `,
}));
