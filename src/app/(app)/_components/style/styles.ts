import { createStyles, css } from "antd-style";

export const useStyles = createStyles(({ token }) => ({
  appLayout: css`
    min-height: 100dvh;
  `,

  sidebar: css`
    background: #0e0955 !important;
    padding: 20px 14px;
  `,

  brand: css`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 2px 6px 18px;
  `,

  brandLogo: css`
    width: 36px;
    height: 36px;
    border-radius: 10px;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, 0.16);
    color: #ffffff;
    font-weight: 700;
    font-size: 13px;
    letter-spacing: 0.5px;
  `,

  brandText: css`
    color: #ffffff;
    font-weight: 700;
    font-size: 18px;
    line-height: 1;
  `,

  sectionLabel: css`
    color: rgba(255, 255, 255, 0.65);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    margin: 12px 8px 8px;
  `,

  navMenu: css`
    background: transparent !important;
    border-inline-end: none !important;

    .ant-menu-item {
      color: rgba(255, 255, 255, 0.88);
      border-radius: 8px;
      margin-inline: 0;
      width: 100%;
    }

    .ant-menu-item-active {
      color: #ffffff !important;
    }

    .ant-menu-item-selected {
      color: #ffffff !important;
      background: rgba(255, 255, 255, 0.18) !important;
      font-weight: 600;
    }
  `,

  mainLayout: css`
    background: ${token.colorBgLayout};
  `,

  header: css`
    background: #0e0955;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding: 0 24px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.2fr) minmax(0, 1fr);
    align-items: center;
    gap: 16px;
  `,

  headerLeft: css`
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  `,

  headerLabel: css`
    color: rgba(255, 255, 255, 0.7);
    font-size: 12px;
    line-height: 1.2;
  `,

  headerCurrentTab: css`
    color: #ffffff;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.3;
    margin-top: 2px;
  `,

  headerRight: css`
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: flex-end;
  `,

  headerCenter: css`
    display: flex;
    justify-content: center;
    align-items: center;
  `,

  searchInput: css`
    width: min(340px, 56vw);
  `,

  profileAvatar: css`
    background: #1677ff !important;
    color: #ffffff !important;
    font-weight: 700;
  `,

  content: css`
    margin: 20px;
    padding: 20px;
    border-radius: 12px;
    background: ${token.colorBgContainer};
  `,
}));
