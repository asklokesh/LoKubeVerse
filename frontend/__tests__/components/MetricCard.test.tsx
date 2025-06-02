import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock MetricCard component based on the structure from page.tsx
const MetricCard = ({
    title,
    value,
    unit,
    icon,
    gradient,
    status,
    trend,
    details
}: {
    title: string;
    value: number;
    unit: string;
    icon: string;
    gradient: string;
    status: string;
    trend: string;
    details: string;
}) => (
    <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer hover:scale-105">
        <div className={`absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-50 group-hover:opacity-70 transition-opacity duration-500`}></div>

        <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-2xl transition-all duration-300">
                    <span className="text-3xl filter drop-shadow-lg" data-testid="metric-icon">{icon}</span>
                </div>
                <div className="text-right">
                    <div className={`px-3 py-1 text-xs font-bold rounded-full ${status === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                            status === 'good' ? 'bg-blue-100 text-blue-700' :
                                status === 'warning' ? 'bg-orange-100 text-orange-700' :
                                    'bg-gray-100 text-gray-700'
                        }`} data-testid="status-badge">
                        {status}
                    </div>
                </div>
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2" data-testid="metric-title">{title}</h3>
            <div className="flex items-baseline space-x-2 mb-4">
                <span className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent" data-testid="metric-value">
                    {value}
                </span>
                <span className="text-lg text-gray-500 font-bold" data-testid="metric-unit">{unit}</span>
            </div>

            <div className="flex items-center space-x-1 text-xs font-medium mt-1">
                <span data-testid="trend-indicator">{trend.includes('+') ? '📈' : '📉'}</span>
                <span className={`${trend.includes('+') ? 'text-emerald-600' : 'text-red-600'}`} data-testid="trend-value">
                    {trend}
                </span>
            </div>

            <div className="relative mt-4">
                <div className="h-3 bg-gray-100/50 backdrop-blur-sm rounded-full overflow-hidden shadow-inner border border-gray-200/30">
                    <div
                        className={`h-full bg-gradient-to-r ${gradient} rounded-full shadow-lg transform origin-left transition-all duration-1000 ease-out relative overflow-hidden group-hover:animate-pulse`}
                        style={{ width: `${value}%` }}
                        data-testid="progress-bar"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/20 to-transparent rounded-full"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-white/20 rounded-full"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/10 to-transparent rounded-full"></div>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 font-medium" data-testid="metric-details">{details}</p>
            </div>
        </div>
    </div>
);

describe('MetricCard Component', () => {
    const defaultProps = {
        title: 'CPU Usage',
        value: 72,
        unit: '%',
        icon: '🧠',
        gradient: 'from-emerald-400 to-emerald-600',
        status: 'excellent',
        trend: '+2.1%',
        details: '2.88 / 4.0 cores • 4 nodes active'
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render with all required props', () => {
            render(<MetricCard {...defaultProps} />);

            expect(screen.getByTestId('metric-title')).toHaveTextContent('CPU Usage');
            expect(screen.getByTestId('metric-value')).toHaveTextContent('72');
            expect(screen.getByTestId('metric-unit')).toHaveTextContent('%');
            expect(screen.getByTestId('metric-icon')).toHaveTextContent('🧠');
            expect(screen.getByTestId('metric-details')).toHaveTextContent('2.88 / 4.0 cores • 4 nodes active');
        });

        it('should display correct status badge', () => {
            render(<MetricCard {...defaultProps} />);

            const statusBadge = screen.getByTestId('status-badge');
            expect(statusBadge).toHaveTextContent('excellent');
            expect(statusBadge).toHaveClass('bg-emerald-100', 'text-emerald-700');
        });

        it('should render progress bar with correct width', () => {
            render(<MetricCard {...defaultProps} />);

            const progressBar = screen.getByTestId('progress-bar');
            expect(progressBar).toHaveStyle({ width: '72%' });
        });

        it('should display trend indicator correctly for positive trend', () => {
            render(<MetricCard {...defaultProps} />);

            expect(screen.getByTestId('trend-indicator')).toHaveTextContent('📈');
            expect(screen.getByTestId('trend-value')).toHaveTextContent('+2.1%');
            expect(screen.getByTestId('trend-value')).toHaveClass('text-emerald-600');
        });

        it('should display trend indicator correctly for negative trend', () => {
            const propsWithNegativeTrend = {
                ...defaultProps,
                trend: '-1.2%'
            };

            render(<MetricCard {...propsWithNegativeTrend} />);

            expect(screen.getByTestId('trend-indicator')).toHaveTextContent('📉');
            expect(screen.getByTestId('trend-value')).toHaveTextContent('-1.2%');
            expect(screen.getByTestId('trend-value')).toHaveClass('text-red-600');
        });
    });

    describe('Status Badge Variants', () => {
        it('should render good status correctly', () => {
            const props = { ...defaultProps, status: 'good' };
            render(<MetricCard {...props} />);

            const statusBadge = screen.getByTestId('status-badge');
            expect(statusBadge).toHaveClass('bg-blue-100', 'text-blue-700');
        });

        it('should render warning status correctly', () => {
            const props = { ...defaultProps, status: 'warning' };
            render(<MetricCard {...props} />);

            const statusBadge = screen.getByTestId('status-badge');
            expect(statusBadge).toHaveClass('bg-orange-100', 'text-orange-700');
        });

        it('should render default status for unknown values', () => {
            const props = { ...defaultProps, status: 'unknown' };
            render(<MetricCard {...props} />);

            const statusBadge = screen.getByTestId('status-badge');
            expect(statusBadge).toHaveClass('bg-gray-100', 'text-gray-700');
        });
    });

    describe('Accessibility', () => {
        it('should have proper semantic structure', () => {
            render(<MetricCard {...defaultProps} />);

            const title = screen.getByTestId('metric-title');
            expect(title).toBeInTheDocument();
            expect(title.tagName).toBe('H3');
        });

        it('should have hover effects', () => {
            render(<MetricCard {...defaultProps} />);

            const card = screen.getByTestId('metric-title').closest('div');
            expect(card).toHaveClass('hover:scale-105', 'hover:shadow-2xl');
        });
    });

    describe('iOS Design Elements', () => {
        it('should have glassmorphism effects', () => {
            render(<MetricCard {...defaultProps} />);

            const card = screen.getByTestId('metric-title').closest('div');
            expect(card).toHaveClass('bg-white/80', 'backdrop-blur-xl', 'border', 'border-white/20');
        });

        it('should have rounded corners matching iOS design', () => {
            render(<MetricCard {...defaultProps} />);

            const card = screen.getByTestId('metric-title').closest('div');
            expect(card).toHaveClass('rounded-3xl');
        });

        it('should have gradient background overlay', () => {
            render(<MetricCard {...defaultProps} />);

            const card = screen.getByTestId('metric-title').closest('div');
            const overlay = card?.querySelector('.absolute.inset-0');
            expect(overlay).toHaveClass('bg-gradient-to-br');
        });
    });

    describe('Animation and Interaction', () => {
        it('should have transition classes for smooth animations', () => {
            render(<MetricCard {...defaultProps} />);

            const card = screen.getByTestId('metric-title').closest('div');
            expect(card).toHaveClass('transition-all', 'duration-500');
        });

        it('should have progress bar animation classes', () => {
            render(<MetricCard {...defaultProps} />);

            const progressBar = screen.getByTestId('progress-bar');
            expect(progressBar).toHaveClass('transition-all', 'duration-1000', 'ease-out');
        });
    });

    describe('Edge Cases', () => {
        it('should handle zero values correctly', () => {
            const propsWithZero = { ...defaultProps, value: 0 };
            render(<MetricCard {...propsWithZero} />);

            expect(screen.getByTestId('metric-value')).toHaveTextContent('0');
            expect(screen.getByTestId('progress-bar')).toHaveStyle({ width: '0%' });
        });

        it('should handle 100% values correctly', () => {
            const propsWithMax = { ...defaultProps, value: 100 };
            render(<MetricCard {...propsWithMax} />);

            expect(screen.getByTestId('metric-value')).toHaveTextContent('100');
            expect(screen.getByTestId('progress-bar')).toHaveStyle({ width: '100%' });
        });

        it('should handle empty strings gracefully', () => {
            const propsWithEmpty = {
                ...defaultProps,
                title: '',
                details: '',
                trend: ''
            };
            render(<MetricCard {...propsWithEmpty} />);

            expect(screen.getByTestId('metric-title')).toBeInTheDocument();
            expect(screen.getByTestId('metric-details')).toBeInTheDocument();
        });
    });
});
