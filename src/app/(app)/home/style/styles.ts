import { createStyles, css } from "antd-style";

export const useStyles = createStyles(({ token }) => ({
  page: css`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,

  headerRow: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  `,

  headerText: css`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,

  headerCurrent: css`
    font-size: 16px;
    font-weight: 600;
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
    box-shadow: 0 12px 26px rgba(15, 41, 83, 0.08);
  `,

  metricLabel: css`
    color: ${token.colorTextSecondary};
    font-size: 13px;
  `,

  metricValue: css`
    font-size: 26px;
    font-weight: 700;
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
    border-radius: 18px;
  `,

  panelCard: css`
    border-radius: 14px;
    height: 100%;
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
