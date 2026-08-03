import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';

export default function SummaryCard({ title, amount, type = 'balance', subtitle, progress }) {
  // Format currency value safely
  const formatCurrency = (val) => {
    const numeric = Number(val) || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(numeric);
  };

  const getVariantStyles = () => {
    switch (type) {
      case 'income':
        return {
          icon: TrendingUp,
          iconBg: 'rgba(16, 185, 129, 0.15)',
          iconColor: '#10b981',
          borderAccent: 'rgba(16, 185, 129, 0.3)'
        };
      case 'expense':
        return {
          icon: TrendingDown,
          iconBg: 'rgba(244, 63, 94, 0.15)',
          iconColor: '#f43f5e',
          borderAccent: 'rgba(244, 63, 94, 0.3)'
        };
      case 'warning':
        return {
          icon: Wallet,
          iconBg: 'rgba(245, 158, 11, 0.15)',
          iconColor: '#f59e0b',
          borderAccent: 'rgba(245, 158, 11, 0.3)'
        };
      case 'balance':
      default:
        return {
          icon: DollarSign,
          iconBg: 'rgba(99, 102, 241, 0.15)',
          iconColor: '#818cf8',
          borderAccent: 'rgba(99, 102, 241, 0.3)'
        };
    }
  };

  const styleConfig = getVariantStyles();
  const IconComponent = styleConfig.icon;

  return (
    <div 
      className="glass-card summary-card"
      style={{ borderColor: styleConfig.borderAccent }}
    >
      <div className="card-top">
        <div className="card-info">
          <span className="card-title">{title}</span>
          <h3 className="card-amount">{formatCurrency(amount)}</h3>
        </div>
        <div 
          className="card-icon-wrapper" 
          style={{ background: styleConfig.iconBg, color: styleConfig.iconColor }}
        >
          <IconComponent size={22} />
        </div>
      </div>

      {subtitle && <p className="card-subtitle">{subtitle}</p>}

      {progress !== undefined && (
        <div className="progress-bar-container">
          <div 
            className="progress-bar-fill" 
            style={{ 
              width: `${Math.min(progress, 100)}%`,
              backgroundColor: progress >= 100 ? '#f43f5e' : progress >= 80 ? '#f59e0b' : '#10b981'
            }}
          />
        </div>
      )}

      <style>{`
        .summary-card {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 120px;
        }

        .card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .card-title {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .card-amount {
          font-size: 1.65rem;
          font-weight: 800;
          margin-top: 0.35rem;
          color: var(--text-main);
          letter-spacing: -0.02em;
        }

        .card-icon-wrapper {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .card-subtitle {
          font-size: 0.8rem;
          color: var(--text-dim);
          margin-top: 0.75rem;
        }

        .progress-bar-container {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 999px;
          margin-top: 0.85rem;
          overflow: hidden;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.4s ease;
        }
      `}</style>
    </div>
  );
}
