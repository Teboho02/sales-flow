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
