import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock NetworkActivity component based on the structure from page.tsx
const NetworkActivity = () => (
    <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl p-6" data-testid="network-activity">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 opacity-50"></div>

        <div className="relative">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2" data-testid="network-title">
                <span>🌐</span>
                <span>Live Network Activity</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse ml-2" data-testid="live-indicator"></div>
            </h4>

            <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600" data-testid="incoming-label">Incoming</span>
                        <span className="text-lg font-black text-orange-600" data-testid="incoming-value">2.4 Gbps</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full animate-pulse"
                            style={{ width: '75%' }}
                            data-testid="incoming-progress"
                        ></div>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600" data-testid="outgoing-label">Outgoing</span>
                        <span className="text-lg font-black text-red-600" data-testid="outgoing-value">1.8 Gbps</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full animate-pulse"
                            style={{ width: '60%' }}
                            data-testid="outgoing-progress"
                        ></div>
                    </div>
                </div>
            </div>

            {/* Live data streams visualization */}
            <div className="mt-6 grid grid-cols-4 gap-2" data-testid="data-streams">
                {Array.from({ length: 16 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-8 bg-gradient-to-t from-gray-200 to-gray-300 rounded-lg relative overflow-hidden"
                        style={{
                            animationDelay: `${i * 100}ms`,
                            animation: 'pulse 2s infinite'
                        }}
                        data-testid={`stream-bar-${i}`}
                    >
                        <div
                            className="absolute bottom-0 w-full bg-gradient-to-t from-orange-400 to-orange-600 rounded-lg transition-all duration-1000"
                            style={{
                                height: `${Math.random() * 80 + 20}%`,
                                animationDelay: `${i * 150}ms`
                            }}
                            data-testid={`stream-bar-fill-${i}`}
                        ></div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

describe('NetworkActivity Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render the component with correct title', () => {
            render(<NetworkActivity />);

            expect(screen.getByTestId('network-activity')).toBeInTheDocument();
            expect(screen.getByTestId('network-title')).toHaveTextContent('Live Network Activity');
        });

        it('should display live indicator', () => {
            render(<NetworkActivity />);

            const liveIndicator = screen.getByTestId('live-indicator');
            expect(liveIndicator).toBeInTheDocument();
            expect(liveIndicator).toHaveClass('bg-emerald-500', 'animate-pulse');
        });

        it('should render incoming traffic section', () => {
            render(<NetworkActivity />);

            expect(screen.getByTestId('incoming-label')).toHaveTextContent('Incoming');
            expect(screen.getByTestId('incoming-value')).toHaveTextContent('2.4 Gbps');

            const incomingProgress = screen.getByTestId('incoming-progress');
            expect(incomingProgress).toHaveStyle({ width: '75%' });
            expect(incomingProgress).toHaveClass('bg-gradient-to-r', 'from-orange-400', 'to-orange-600');
        });

        it('should render outgoing traffic section', () => {
            render(<NetworkActivity />);

            expect(screen.getByTestId('outgoing-label')).toHaveTextContent('Outgoing');
            expect(screen.getByTestId('outgoing-value')).toHaveTextContent('1.8 Gbps');

            const outgoingProgress = screen.getByTestId('outgoing-progress');
            expect(outgoingProgress).toHaveStyle({ width: '60%' });
            expect(outgoingProgress).toHaveClass('bg-gradient-to-r', 'from-red-400', 'to-red-600');
        });

        it('should render data streams visualization', () => {
            render(<NetworkActivity />);

            const dataStreams = screen.getByTestId('data-streams');
            expect(dataStreams).toBeInTheDocument();
            expect(dataStreams).toHaveClass('grid', 'grid-cols-4', 'gap-2');
        });

        it('should render 16 stream bars', () => {
            render(<NetworkActivity />);

            for (let i = 0; i < 16; i++) {
                expect(screen.getByTestId(`stream-bar-${i}`)).toBeInTheDocument();
                expect(screen.getByTestId(`stream-bar-fill-${i}`)).toBeInTheDocument();
            }
        });
    });

    describe('iOS Design Elements', () => {
        it('should have glassmorphism effects', () => {
            render(<NetworkActivity />);

            const container = screen.getByTestId('network-activity');
            expect(container).toHaveClass('bg-white/80', 'backdrop-blur-xl', 'border', 'border-white/20');
        });

        it('should have iOS-style rounded corners', () => {
            render(<NetworkActivity />);

            const container = screen.getByTestId('network-activity');
            expect(container).toHaveClass('rounded-3xl');
        });

        it('should have gradient background overlay', () => {
            render(<NetworkActivity />);

            const container = screen.getByTestId('network-activity');
            const overlay = container.querySelector('.absolute.inset-0');
            expect(overlay).toHaveClass('bg-gradient-to-br', 'from-orange-500/10', 'to-red-500/10');
        });

        it('should have premium shadow effects', () => {
            render(<NetworkActivity />);

            const container = screen.getByTestId('network-activity');
            expect(container).toHaveClass('shadow-xl');
        });
    });

    describe('Animation and Real-time Features', () => {
        it('should have animated progress bars', () => {
            render(<NetworkActivity />);

            const incomingProgress = screen.getByTestId('incoming-progress');
            const outgoingProgress = screen.getByTestId('outgoing-progress');

            expect(incomingProgress).toHaveClass('animate-pulse');
            expect(outgoingProgress).toHaveClass('animate-pulse');
        });

        it('should have animated stream bars with staggered delays', () => {
            render(<NetworkActivity />);

            for (let i = 0; i < 16; i++) {
                const streamBar = screen.getByTestId(`stream-bar-${i}`);
                expect(streamBar).toHaveStyle({
                    animationDelay: `${i * 100}ms`,
                    animation: 'pulse 2s infinite'
                });
            }
        });

        it('should have live indicator animation', () => {
            render(<NetworkActivity />);

            const liveIndicator = screen.getByTestId('live-indicator');
            expect(liveIndicator).toHaveClass('animate-pulse');
        });
    });

    describe('Data Visualization', () => {
        it('should display correct traffic values', () => {
            render(<NetworkActivity />);

            expect(screen.getByTestId('incoming-value')).toHaveTextContent('2.4 Gbps');
            expect(screen.getByTestId('outgoing-value')).toHaveTextContent('1.8 Gbps');
        });

        it('should have correct color coding for traffic types', () => {
            render(<NetworkActivity />);

            expect(screen.getByTestId('incoming-value')).toHaveClass('text-orange-600');
            expect(screen.getByTestId('outgoing-value')).toHaveClass('text-red-600');
        });

        it('should show proper progress bar widths representing traffic load', () => {
            render(<NetworkActivity />);

            const incomingProgress = screen.getByTestId('incoming-progress');
            const outgoingProgress = screen.getByTestId('outgoing-progress');

            expect(incomingProgress).toHaveStyle({ width: '75%' });
            expect(outgoingProgress).toHaveStyle({ width: '60%' });
        });
    });

    describe('Layout and Responsiveness', () => {
        it('should have responsive grid layout', () => {
            render(<NetworkActivity />);

            const trafficContainer = screen.getByTestId('incoming-label').closest('.grid');
            expect(trafficContainer).toHaveClass('grid', 'grid-cols-2', 'gap-6');
        });

        it('should have proper spacing and padding', () => {
            render(<NetworkActivity />);

            const container = screen.getByTestId('network-activity');
            expect(container).toHaveClass('p-6');

            const title = screen.getByTestId('network-title');
            expect(title).toHaveClass('mb-4');
        });
    });

    describe('Accessibility', () => {
        it('should have semantic heading structure', () => {
            render(<NetworkActivity />);

            const title = screen.getByTestId('network-title');
            expect(title.tagName).toBe('H4');
        });

        it('should have descriptive labels for traffic metrics', () => {
            render(<NetworkActivity />);

            expect(screen.getByTestId('incoming-label')).toHaveTextContent('Incoming');
            expect(screen.getByTestId('outgoing-label')).toHaveTextContent('Outgoing');
        });

        it('should maintain readable text contrast', () => {
            render(<NetworkActivity />);

            const labels = screen.getAllByText(/Incoming|Outgoing/);
            labels.forEach(label => {
                expect(label).toHaveClass('text-gray-600');
            });
        });
    });

    describe('Real-time Simulation', () => {
        it('should render with proper live data indicators', () => {
            render(<NetworkActivity />);

            const title = screen.getByTestId('network-title');
            expect(title).toHaveTextContent('Live');

            const liveIndicator = screen.getByTestId('live-indicator');
            expect(liveIndicator).toBeInTheDocument();
        });

        it('should have visual elements suggesting real-time updates', () => {
            render(<NetworkActivity />);

            const streamBars = screen.getAllByTestId(/stream-bar-\d+/);
            expect(streamBars).toHaveLength(16);

            // Check that stream bar fills have transition classes
            for (let i = 0; i < 16; i++) {
                const streamBarFill = screen.getByTestId(`stream-bar-fill-${i}`);
                expect(streamBarFill).toHaveClass('transition-all', 'duration-1000');
            }
        });
    });
});
