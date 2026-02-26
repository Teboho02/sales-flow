import { createStyles, css } from "antd-style";

export const useStyles = createStyles(({ token }) => ({
  pageWrapper: css`
    min-height: 100vh;
    display: flex;
    width: 100%;
    background: ${token.colorBgContainer};

    @media (max-width: 900px) {
      flex-direction: column;
    }
  `,

  leftPanel: css`
    flex: 1;
    background: ${token.colorPrimary};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;

    @media (max-width: 700px) {
      display: none;
    }
  `,

  leftPanelContent: css`
    width: min(520px, 100%);
  `,

  brandRow: css`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
  `,

  logoSquare: css`
    width: 48px;
    height: 48px;
    border-radius: 10px;
    background: #8bc3ff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  `,

  logoLetter: css`
    color: ${token.colorWhite};
    font-size: 24px;
    font-weight: 700;
    line-height: 1;
  `,

  rightPanel: css`
    flex: 1;
    background: ${token.colorBgContainer};
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
  `,
  content: css`
    width: min(420px, 100%);
    background: rgba(255, 255, 255, 0.96);
    border-radius: 18px;
    padding: 24px;
    box-shadow: 0 20px 48px rgba(2, 10, 26, 0.2);
  `,
  header: css`
    text-align: left;
    margin-bottom: 24px;
  `,
  appName: css`
    display: block;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${token.colorPrimary};
    margin-bottom: 8px;
  `,
  title: css`
    margin-bottom: 4px !important;
    color: ${token.colorTextHeading};
  `,
  subtitle: css`
    display: block;
    font-size: 14px;
    color: ${token.colorTextSecondary};
  `,

  leftTitle: css`
    margin: 0 !important;
    color: ${token.colorWhite};
    letter-spacing: 0.02em;
  `,

  leftSubtitle: css`
    display: block;
    max-width: 420px;
    color: rgba(255, 255, 255, 0.92);
    font-size: 18px;
    line-height: 1.6;
  `,

  form: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,

  segmented: css`
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 8px;

    .ant-radio-button-wrapper {
      text-align: center;
      white-space: normal;
      height: auto;
      padding: 10px 12px;
    }
  `,

  submitButton: css`
    height: 44px;
    font-weight: 600;
    background: ${token.colorPrimary};
  `,
}));
