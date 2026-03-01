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
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 16px;

    @media (max-width: ${token.screenMD}px) {
      padding: 0 ${token.paddingSM}px;
      gap: ${token.marginXS}px;
    }
  `,

  headerLeft: css`
    min-width: 0;
    display: flex;
    align-items: center;
    gap: ${token.marginXS}px;
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

    @media (max-width: ${token.screenMD}px) {
      font-size: 16px;
    }
  `,

  headerRight: css`
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: flex-end;
  `,

  searchInput: css`
    width: 240px;

    .ant-input,
    .ant-input-affix-wrapper {
      border-radius: ${token.borderRadiusLG}px;
      border-color: ${token.colorBorder};
      background: ${token.colorBgContainer};
    }

    @media (max-width: ${token.screenMD}px) {
      width: 180px;
    }

    @media (max-width: ${token.screenSM}px) {
      display: none;
    }
  `,

  mobileMenuButton: css`
    color: #ffffff !important;
    border: none;

    &:hover,
    &:focus {
      color: #ffffff !important;
      background: rgba(255, 255, 255, 0.16) !important;
    }
  `,

  profileAvatar: css`
    background: #1677ff !important;
    color: #ffffff !important;
    font-weight: 700;
  `,

  mobileDrawer: css`
    .ant-drawer-content,
    .ant-drawer-header,
    .ant-drawer-body {
      background: #0e0955;
    }

    .ant-drawer-header {
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding: 14px 16px;
    }

    .ant-drawer-title,
    .ant-drawer-close {
      color: #ffffff !important;
    }

    .ant-drawer-body {
      padding: 20px 14px;
    }
  `,

  content: css`
    margin: 20px;
    padding: 20px;
    border-radius: 12px;
    background: ${token.colorBgContainer};

    @media (max-width: ${token.screenMD}px) {
      margin: ${token.marginSM}px;
      padding: ${token.paddingSM}px;
      border-radius: ${token.borderRadius}px;
    }
  `,

  sidebarFooter: css`
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  `,

  sidebarAskAiButton: css`
    border-radius: 8px !important;
    font-weight: 600 !important;
    background: rgba(255, 255, 255, 0.12) !important;
    border: 1px solid rgba(255, 255, 255, 0.2) !important;
    color: #ffffff !important;

    &:hover {
      background: rgba(255, 255, 255, 0.2) !important;
      border-color: rgba(255, 255, 255, 0.35) !important;
      color: #ffffff !important;
    }
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

  assistantHint: css`
    color: ${token.colorTextSecondary};
    font-size: 13px;
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

  assistantPromptMeta: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${token.marginXS}px;
    flex-wrap: wrap;
  `,

  assistantPromptCount: css`
    color: ${token.colorTextSecondary};
    font-size: 12px;
  `,

  assistantIntentBadge: css`
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    border: 1px solid rgba(22, 119, 255, 0.24);
    padding: 3px 10px;
    font-size: 11px;
    font-weight: ${token.fontWeightStrong};
    color: ${token.colorPrimary};
    background: rgba(22, 119, 255, 0.08);
    letter-spacing: 0.3px;
  `,

  assistantIntentBadgeClient: css`
    display: inline-flex;
    align-items: center;
    border-radius: 999px;
    border: 1px solid rgba(82, 196, 26, 0.34);
    padding: 3px 10px;
    font-size: 11px;
    font-weight: ${token.fontWeightStrong};
    color: #237804;
    background: rgba(82, 196, 26, 0.1);
    letter-spacing: 0.3px;
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

  voiceLivePanel: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${token.marginSM}px;
    border: 1px solid rgba(22, 119, 255, 0.15);
    border-radius: ${token.borderRadius}px;
    padding: 8px 10px;
    background: rgba(22, 119, 255, 0.04);
  `,

  voiceWave: css`
    display: inline-flex;
    align-items: flex-end;
    gap: 4px;
    min-width: 58px;
    height: 18px;
  `,

  voiceWaveBar: css`
    width: 3px;
    height: 8px;
    border-radius: 999px;
    background: linear-gradient(180deg, #52c4ff 0%, #1677ff 100%);
    animation: aiVoiceWave 0.9s ease-in-out infinite;
    transform-origin: center bottom;

    @keyframes aiVoiceWave {
      0%,
      100% {
        transform: scaleY(0.35);
        opacity: 0.5;
      }
      50% {
        transform: scaleY(1.55);
        opacity: 1;
      }
    }
  `,

  assistantThinking: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${token.marginSM}px;
    border-radius: ${token.borderRadius}px;
    border: 1px solid rgba(22, 119, 255, 0.2);
    padding: 10px 12px;
    background: rgba(22, 119, 255, 0.05);
  `,

  assistantThinkingText: css`
    color: ${token.colorTextSecondary};
    font-size: 13px;
  `,

  assistantThinkingDots: css`
    display: inline-flex;
    gap: 4px;
  `,

  assistantThinkingDot: css`
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${token.colorPrimary};
    animation: aiThinkingPulse 0.8s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.12s;
    }

    &:nth-child(3) {
      animation-delay: 0.24s;
    }

    @keyframes aiThinkingPulse {
      0%,
      100% {
        transform: scale(0.8);
        opacity: 0.45;
      }
      50% {
        transform: scale(1.12);
        opacity: 1;
      }
    }
  `,

  assistantAnswer: css`
    border-radius: 12px;
    border: 1px solid rgba(22, 119, 255, 0.2);
    background:
      linear-gradient(150deg, rgba(22, 119, 255, 0.06) 0%, rgba(82, 196, 255, 0.03) 100%),
      ${token.colorBgContainer};
    padding: 12px 14px;
    animation: aiAnswerIn 0.3s ease-out;

    @keyframes aiAnswerIn {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,

  assistantAnswerHeader: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${token.marginXS}px;
    margin-bottom: 6px;
  `,

  assistantAnswerLabel: css`
    color: ${token.colorTextHeading};
    font-weight: ${token.fontWeightStrong};
    font-size: 12px;
    letter-spacing: 0.4px;
    text-transform: uppercase;
  `,

  assistantAnswerTime: css`
    color: ${token.colorTextQuaternary};
    font-size: 11px;
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
}));
