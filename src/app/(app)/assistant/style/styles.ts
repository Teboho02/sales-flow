import { createStyles, css } from "antd-style";

export const useStyles = createStyles(({ token }) => ({
  page: css`
    width: 100%;
    min-height: 100%;
    display: flex;
    justify-content: center;
    padding: ${token.paddingXS}px;
    background: linear-gradient(
      135deg,
      ${token.colorPrimaryBg} 0%,
      ${token.colorBgLayout} 55%,
      ${token.colorBgContainer} 100%
    );
    border-radius: ${token.borderRadiusLG}px;
  `,

  card: css`
    width: min(1040px, 100%);
    border-radius: ${token.borderRadiusLG}px;
    border: 1px solid ${token.colorBorderSecondary};
    box-shadow: ${token.boxShadowTertiary};
    background: ${token.colorBgContainer};
  `,

  header: css`
    display: flex;
    flex-direction: column;
    gap: ${token.marginXXS}px;
  `,

  title: css`
    margin-bottom: 0 !important;
  `,

  hint: css`
    color: ${token.colorTextSecondary};
  `,

  quickPrompt: css`
    border: 1px solid ${token.colorPrimaryBorder};
    color: ${token.colorPrimary};
    background: ${token.colorPrimaryBg};

    &:hover {
      border-color: ${token.colorPrimary};
      color: ${token.colorPrimary};
      background: ${token.colorPrimaryBgHover};
    }
  `,

  outlineButton: css`
    border: 1px solid ${token.colorPrimary};
    color: ${token.colorPrimary};

    &:hover {
      border-color: ${token.colorPrimaryHover};
      color: ${token.colorPrimaryHover};
      background: ${token.colorPrimaryBg};
    }
  `,

  answerCard: css`
    border-radius: ${token.borderRadius}px;
    border: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorFillAlter};
    padding: ${token.padding}px;
  `,

  answerText: css`
    white-space: pre-wrap;
    color: ${token.colorText};
    line-height: 1.6;
  `,
}));
