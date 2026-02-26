import { createStyles, css } from "antd-style";

export const useStyles = createStyles(({ token }) => ({
  card: css`
    border-radius: ${token.borderRadiusLG}px;
  `,

  container: css`
    width: 100%;
  `,

  headerRow: css`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: ${token.marginSM}px;
    flex-wrap: wrap;
  `,

  headerText: css`
    min-width: 0;
  `,

  title: css`
    margin: 0 !important;
  `,

  subtitle: css`
    display: block;
    margin-top: 2px;
  `,

  actions: css`
    display: flex;
    align-items: center;
    gap: ${token.marginXS}px;
    flex-wrap: wrap;

    @media (max-width: ${token.screenMD}px) {
      width: 100%;
      > * {
        width: 100%;
      }
    }
  `,

  filterRow: css`
    width: 100%;
    gap: ${token.marginXS}px 0;
  `,

  searchInput: css`
    width: 240px;

    @media (max-width: ${token.screenMD}px) {
      width: 100%;
    }
  `,

  filterSelect: css`
    min-width: 140px;

    @media (max-width: ${token.screenMD}px) {
      min-width: 100%;
      width: 100%;
    }
  `,

  table: css`
    .ant-table-thead > tr > th {
      white-space: nowrap;
    }
  `,
}));
