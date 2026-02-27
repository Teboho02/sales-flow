import { createStyles, css } from "antd-style";

export const useStyles = createStyles(({ token }) => ({
  page: css`
    background: linear-gradient(135deg, #e8f1ff 0%, #f7fbff 48%, #ffffff 100%) !important;
    padding: 16px;
    border-radius: 14px;
    min-height: 100%;

    @media (max-width: ${token.screenMD}px) {
      padding: ${token.paddingXS}px;
      border-radius: ${token.borderRadius}px;
    }
  `,

  card: css`
    border-radius: 14px;
    box-shadow: 0 14px 32px rgba(22, 119, 255, 0.08) !important;
    border: 1px solid rgba(22, 119, 255, 0.06) !important;
    overflow: hidden;
    background: #ffffff !important;

    :global(.ant-card-body) {
      padding: 18px 18px 16px;

      @media (max-width: ${token.screenMD}px) {
        padding: ${token.paddingSM}px;
      }
    }
  `,

  container: css`
    width: 100%;
  `,

  headerRow: css`
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  `,

  headerText: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,

  title: css`
    margin: 0 !important;
  `,

  subtitle: css`
    color: #5f708a !important;
    font-size: 13px;
  `,

  actions: css`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    @media (max-width: ${token.screenMD}px) {
      width: 100%;
      > button {
        width: 100%;
      }
    }
  `,

  filterRow: css`
    padding: 6px 0 2px;
    min-height: 12px;
  `,

  filterSelect: css`
    min-width: 170px;

    @media (max-width: ${token.screenSM}px) {
      width: 100%;
    }
  `,

  filterInput: css`
    min-width: 250px;

    @media (max-width: ${token.screenSM}px) {
      width: 100%;
    }
  `,

  table: css`
    :global(.ant-table-thead > tr > th) {
      background: #f3f6ff !important;
      font-weight: 700 !important;
      color: #1d2a44 !important;
      white-space: nowrap;
    }

    :global(.ant-table-tbody > tr:nth-child(odd)) {
      background: #fafcff !important;
    }

    :global(.ant-table) {
      border-radius: 10px;
      overflow: hidden;
    }
  `,
}));
