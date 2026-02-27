import { createStyles, css } from "antd-style";

export const useStyles = createStyles(({ token }) => ({
  page: css`
    display: flex;
    flex-direction: column;
    gap: 24px;
    background: linear-gradient(135deg, #f8fbff 0%, #eef3ff 40%, #ffffff 100%);
    padding: 6px;
    border-radius: 12px;
  `,

  headerRow: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    padding: 8px 4px;
  `,

  headerText: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,

  headerCurrent: css`
    font-size: 17px;
    font-weight: 700;
    color: ${token.colorTextHeading};
  `,

  metricsGrid: css`
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;

    @media (max-width: 1100px) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  `,

  metricCard: css`
    border-radius: 16px;
    box-shadow: 0 10px 24px rgba(22, 119, 255, 0.08);
    padding: 16px 18px;
    border: 1px solid rgba(22, 119, 255, 0.06);
    background: #ffffff;
  `,

  metricLabel: css`
    color: ${token.colorTextSecondary};
    font-size: 13px;
    letter-spacing: 0.1px;
  `,

  metricValue: css`
    font-size: 28px;
    font-weight: 800;
    color: ${token.colorTextHeading};
  `,

  changeTag: css`
    border-radius: 999px;
    font-weight: 600;
  `,

  lowerGrid: css`
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: 16px;

    @media (max-width: 1000px) {
      grid-template-columns: 1fr;
    }
  `,

  activityCard: css`
    border-radius: 14px;
  `,

  panelCard: css`
    border-radius: 14px;
    height: 100%;
    box-shadow: 0 6px 18px rgba(15, 41, 83, 0.06);
  `,

  assistantLaunchButton: css`
    position: relative;
    border: none;
    color: ${token.colorWhite} !important;
    font-weight: ${token.fontWeightStrong};
    letter-spacing: 0.3px;
    border-radius: 999px;
    padding-inline: ${token.paddingMD}px;
    background: linear-gradient(120deg, ${token.colorPrimary} 0%, #2597ff 45%, #52c4ff 100%);
    box-shadow:
      0 10px 24px rgba(22, 119, 255, 0.28),
      0 0 0 1px rgba(82, 196, 255, 0.35) inset;
    transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;

    > span {
      position: relative;
      z-index: 1;
    }

    &::before {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(
        105deg,
        rgba(255, 255, 255, 0.04) 0%,
        rgba(255, 255, 255, 0.42) 25%,
        rgba(255, 255, 255, 0.04) 55%
      );
      transform: translateX(-120%);
      transition: transform 0.45s ease;
    }

    &:hover {
      color: ${token.colorWhite} !important;
      transform: translateY(-1px);
      filter: saturate(1.1);
      box-shadow:
        0 14px 30px rgba(22, 119, 255, 0.36),
        0 0 0 1px rgba(82, 196, 255, 0.45) inset;

      &::before {
        transform: translateX(140%);
      }
    }

    &:active {
      transform: translateY(0);
    }
  `,

  assistantClientButton: css`
    border: 1px solid ${token.colorSuccess};
    color: ${token.colorSuccess};
    background: ${token.colorBgContainer};

    &:hover {
      border-color: ${token.colorSuccessHover};
      color: ${token.colorSuccessHover};
      background: ${token.colorSuccessBg};
    }
  `,

  assistantCard: css`
    border-radius: 14px;
    box-shadow: 0 8px 20px rgba(15, 41, 83, 0.06);
    border: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgContainer};
  `,

  assistantHint: css`
    color: ${token.colorTextSecondary};
    font-size: 13px;
  `,

  assistantModal: css`
    .ant-modal-content {
      border-radius: ${token.borderRadiusLG + 6}px;
      border: 1px solid rgba(22, 119, 255, 0.2);
      background:
        radial-gradient(140% 90% at -5% -10%, rgba(82, 196, 255, 0.22) 0%, transparent 45%),
        radial-gradient(100% 80% at 120% 0%, rgba(22, 119, 255, 0.16) 0%, transparent 60%),
        ${token.colorBgContainer};
      box-shadow:
        0 20px 48px rgba(15, 41, 83, 0.22),
        0 0 0 1px rgba(82, 196, 255, 0.2) inset;
      overflow: hidden;
    }

    .ant-modal-header {
      background: transparent;
      border-bottom: 1px solid rgba(22, 119, 255, 0.16);
      margin-bottom: 14px;
      padding-bottom: 14px;
    }

    .ant-modal-title {
      color: ${token.colorTextHeading};
      font-weight: ${token.fontWeightStrong};
      letter-spacing: 0.2px;
    }

    .ant-modal-close {
      color: ${token.colorTextSecondary};
    }
  `,

  assistantHero: css`
    display: flex;
    flex-direction: column;
    gap: 4px;
    border: 1px solid rgba(82, 196, 255, 0.35);
    border-radius: ${token.borderRadiusLG}px;
    padding: ${token.paddingSM}px;
    background:
      linear-gradient(135deg, rgba(22, 119, 255, 0.12) 0%, rgba(82, 196, 255, 0.08) 100%),
      ${token.colorBgContainer};
  `,

  assistantBadge: css`
    display: inline-flex;
    width: fit-content;
    border-radius: 999px;
    border: 1px solid rgba(22, 119, 255, 0.35);
    padding: 2px 10px;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    font-size: 11px;
    color: ${token.colorPrimary};
    background: rgba(22, 119, 255, 0.08);
    font-weight: ${token.fontWeightStrong};
  `,

  assistantHeroText: css`
    color: ${token.colorText};
    line-height: 1.5;
  `,

  assistantPromptInput: css`
    .ant-input {
      border-radius: ${token.borderRadiusLG}px;
      border: 1px solid rgba(22, 119, 255, 0.24);
      background: rgba(255, 255, 255, 0.9);
      box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.03) inset;
    }

    .ant-input:focus,
    .ant-input-focused {
      border-color: ${token.colorPrimary};
      box-shadow: 0 0 0 3px rgba(22, 119, 255, 0.12);
    }
  `,

  speechRow: css`
    width: 100%;
    align-items: center;
    justify-content: space-between;
    gap: ${token.marginXS}px;
  `,

  speechButton: css`
    border: 1px solid rgba(22, 119, 255, 0.35);
    color: ${token.colorPrimary};
    background: ${token.colorBgContainer};
    border-radius: 999px;
    font-weight: ${token.fontWeightStrong};

    &:hover {
      border-color: ${token.colorPrimary};
      color: ${token.colorPrimary};
      background: ${token.colorPrimaryBg};
    }
  `,

  speechButtonActive: css`
    border: 1px solid #13c2c2;
    color: #006d75;
    background: linear-gradient(120deg, rgba(54, 207, 201, 0.16) 0%, rgba(36, 186, 173, 0.06) 100%);
    border-radius: 999px;
    font-weight: ${token.fontWeightStrong};
    box-shadow:
      0 0 0 1px rgba(19, 194, 194, 0.24) inset,
      0 8px 18px rgba(19, 194, 194, 0.16);
  `,

  speechHint: css`
    color: ${token.colorTextSecondary};
    font-size: 12px;
  `,

  assistantActions: css`
    width: 100%;
  `,

  assistantPrimaryButton: css`
    border: none;
    font-weight: ${token.fontWeightStrong};
    background: linear-gradient(120deg, ${token.colorPrimary} 0%, #2da4ff 100%);
    box-shadow: 0 10px 24px rgba(22, 119, 255, 0.3);
  `,

  assistantAnswer: css`
    border-radius: 12px;
    border: 1px solid rgba(22, 119, 255, 0.2);
    background:
      linear-gradient(150deg, rgba(22, 119, 255, 0.06) 0%, rgba(82, 196, 255, 0.03) 100%),
      ${token.colorBgContainer};
    padding: 12px 14px;
  `,

  assistantAnswerText: css`
    white-space: pre-wrap;
    line-height: 1.6;
    color: ${token.colorText};
  `,

  assistantClientPreview: css`
    border-radius: 10px;
    border: 1px solid ${token.colorBorderSecondary};
    background: ${token.colorBgContainer};
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,

  assistantClientPreviewTitle: css`
    font-weight: ${token.fontWeightStrong};
    color: ${token.colorTextHeading};
  `,

  assistantClientPreviewText: css`
    color: ${token.colorTextSecondary};
    line-height: 1.5;
  `,

  activityItem: css`
    padding: 12px 0;
  `,

  activityMeta: css`
    color: ${token.colorTextSecondary};
    font-size: 12px;
  `,

  insightCard: css`
    border-radius: 18px;
    background: linear-gradient(135deg, #e7f1ff 0%, #ffffff 70%);
    border: 1px solid rgba(22, 119, 255, 0.08);
  `,

  insightLabel: css`
    color: ${token.colorTextSecondary};
    font-size: 13px;
  `,

  progressRow: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  `,
}));
