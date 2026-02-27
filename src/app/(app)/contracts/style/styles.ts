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

  filterSelect: css`
    min-width: 160px;

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

  termsLabelRow: css`
    display: inline-flex;
    align-items: center;
    gap: ${token.marginXS}px;
  `,

  termsAiButton: css`
    border: 1px solid ${token.colorPrimary};
    color: ${token.colorPrimary};
    background: ${token.colorBgContainer};

    &:hover {
      border-color: ${token.colorPrimaryHover};
      color: ${token.colorPrimaryHover};
      background: ${token.colorPrimaryBg};
    }
  `,

  termsAiModalBody: css`
    width: 100%;
  `,

  termsAiHint: css`
    display: block;
  `,

  termsAiNotes: css`
    border: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorFillAlter};
    border-radius: ${token.borderRadius}px;
    padding: ${token.paddingSM}px;
  `,

  termsAiNoteItem: css`
    display: block;
    color: ${token.colorTextSecondary};
    line-height: 1.5;
  `,
}));
