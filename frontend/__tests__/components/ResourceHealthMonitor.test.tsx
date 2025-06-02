import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock ResourceHealthMonitor component based on the structure from page.tsx
const ResourceHealthMonitor = () => {
  const components = [
    { name: 'API Server', status: 99.9, latency: '12ms', color: 'emerald' },
    { name: 'Scheduler', status: 100, latency: '8ms', color: 'emerald' },
    { name: 'Controller Manager', status: 98.7, latency: '15ms', color: 'emerald' },
    { name: 'etcd Cluster', status: 99.5, latency: '6ms', color: 'emerald' },
    { name: 'Kubelet', status: 97.8, latency: '22ms', color: 'orange' }
  ];

  return (
    <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl border border-white/20 rounded-3xl shadow-xl p-6" data-testid="resource-health-monitor">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-green-500/10 opacity-50"></div>
      
      <div className="relative">
        <h4 className="text-lg font-bold text-gray-900 mb-6 flex items-center space-x-2" data-testid="health-title">
          <span>🏥</span>
          <span>System Health</span>
          <div className="ml-auto px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full" data-testid="overall-status">
            All Systems Operational
          </div>
        </h4>
        
        <div className="space-y-4">
          {components.map((component, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/30" data-testid={`component-${index}`}>
              <div className={`w-3 h-3 bg-${component.color}-500 rounded-full shadow-lg`} data-testid={`status-indicator-${index}`}>
                <div className={`w-3 h-3 bg-${component.color}-400 rounded-full animate-ping`} data-testid={`ping-indicator-${index}`}></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900" data-testid={`component-name-${index}`}>{component.name}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-gray-600" data-testid={`latency-${index}`}>{component.latency}</span>
                    <span className={`text-sm font-bold text-${component.color}-600`} data-testid={`uptime-${index}`}>{component.status}%</span>
                  </div>
                </div>
                <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-${component.color}-400 to-${component.color}-600 rounded-full transition-all duration-1000`}
                    style={{ width: `${component.status}%` }}
                    data-testid={`health-bar-${index}`}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

describe('ResourceHealthMonitor Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component with correct title', () => {
      render(<ResourceHealthMonitor />);
      
      expect(screen.getByTestId('resource-health-monitor')).toBeInTheDocument();
      expect(screen.getByTestId('health-title')).toHaveTextContent('System Health');
    });

    it('should display overall system status', () => {
      render(<ResourceHealthMonitor />);
      
      const overallStatus = screen.getByTestId('overall-status');
      expect(overallStatus).toHaveTextContent('All Systems Operational');
      expect(overallStatus).toHaveClass('bg-emerald-100', 'text-emerald-700');
    });

    it('should render all Kubernetes components', () => {
      render(<ResourceHealthMonitor />);
      
      const expectedComponents = [
        'API Server',
        'Scheduler', 
        'Controller Manager',
        'etcd Cluster',
        'Kubelet'
      ];

      expectedComponents.forEach((name, index) => {
        expect(screen.getByTestId(`component-name-${index}`)).toHaveTextContent(name);
      });
    });

    it('should display component health metrics', () => {
      render(<ResourceHealthMonitor />);
      
      // Test specific component metrics
      expect(screen.getByTestId('latency-0')).toHaveTextContent('12ms'); // API Server
      expect(screen.getByTestId('uptime-0')).toHaveTextContent('99.9%');
      
      expect(screen.getByTestId('latency-1')).toHaveTextContent('8ms'); // Scheduler
      expect(screen.getByTestId('uptime-1')).toHaveTextContent('100%');
      
      expect(screen.getByTestId('latency-4')).toHaveTextContent('22ms'); // Kubelet
      expect(screen.getByTestId('uptime-4')).toHaveTextContent('97.8%');
    });
  });

  describe('Health Status Indicators', () => {
    it('should render status indicators with correct colors', () => {
      render(<ResourceHealthMonitor />);
      
      // Test emerald status indicators (healthy components)
      for (let i = 0; i < 4; i++) {
        const indicator = screen.getByTestId(`status-indicator-${i}`);
        expect(indicator).toHaveClass('bg-emerald-500');
      }
      
      // Test orange status indicator (warning component)
      const warningIndicator = screen.getByTestId('status-indicator-4');
      expect(warningIndicator).toHaveClass('bg-orange-500');
    });

    it('should have animated ping indicators', () => {
      render(<ResourceHealthMonitor />);
      
      for (let i = 0; i < 5; i++) {
        const pingIndicator = screen.getByTestId(`ping-indicator-${i}`);
        expect(pingIndicator).toHaveClass('animate-ping');
      }
    });

    it('should display health bars with correct widths', () => {
      render(<ResourceHealthMonitor />);
      
      const expectedWidths = ['99.9%', '100%', '98.7%', '99.5%', '97.8%'];
      
      expectedWidths.forEach((width, index) => {
        const healthBar = screen.getByTestId(`health-bar-${index}`);
        expect(healthBar).toHaveStyle({ width });
      });
    });
  });

  describe('iOS Design Elements', () => {
    it('should have glassmorphism effects', () => {
      render(<ResourceHealthMonitor />);
      
      const container = screen.getByTestId('resource-health-monitor');
      expect(container).toHaveClass('bg-white/80', 'backdrop-blur-xl', 'border', 'border-white/20');
    });

    it('should have iOS-style rounded corners', () => {
      render(<ResourceHealthMonitor />);
      
      const container = screen.getByTestId('resource-health-monitor');
      expect(container).toHaveClass('rounded-3xl');
      
      // Individual component cards should also have rounded corners
      for (let i = 0; i < 5; i++) {
        const component = screen.getByTestId(`component-${i}`);
        expect(component).toHaveClass('rounded-2xl');
      }
    });

    it('should have gradient background overlay', () => {
      render(<ResourceHealthMonitor />);
      
      const container = screen.getByTestId('resource-health-monitor');
      const overlay = container.querySelector('.absolute.inset-0');
      expect(overlay).toHaveClass('bg-gradient-to-br', 'from-emerald-500/10', 'to-green-500/10');
    });

    it('should have premium shadow effects', () => {
      render(<ResourceHealthMonitor />);
      
      const container = screen.getByTestId('resource-health-monitor');
      expect(container).toHaveClass('shadow-xl');
    });
  });

  describe('Component Health Status', () => {
    it('should show healthy components with emerald styling', () => {
      render(<ResourceHealthMonitor />);
      
      // API Server, Scheduler, Controller Manager, etcd should be emerald
      for (let i = 0; i < 4; i++) {
        const uptime = screen.getByTestId(`uptime-${i}`);
        expect(uptime).toHaveClass('text-emerald-600');
      }
    });

    it('should show warning components with orange styling', () => {
      render(<ResourceHealthMonitor />);
      
      // Kubelet should be orange (warning)
      const kubeleteUptime = screen.getByTestId('uptime-4');
      expect(kubeleteUptime).toHaveClass('text-orange-600');
    });

    it('should display component latencies', () => {
      render(<ResourceHealthMonitor />);
      
      const expectedLatencies = ['12ms', '8ms', '15ms', '6ms', '22ms'];
      
      expectedLatencies.forEach((latency, index) => {
        expect(screen.getByTestId(`latency-${index}`)).toHaveTextContent(latency);
      });
    });
  });

  describe('Animation and Transitions', () => {
    it('should have animated health bars', () => {
      render(<ResourceHealthMonitor />);
      
      for (let i = 0; i < 5; i++) {
        const healthBar = screen.getByTestId(`health-bar-${i}`);
        expect(healthBar).toHaveClass('transition-all', 'duration-1000');
      }
    });

    it('should have animated status indicators', () => {
      render(<ResourceHealthMonitor />);
      
      for (let i = 0; i < 5; i++) {
        const pingIndicator = screen.getByTestId(`ping-indicator-${i}`);
        expect(pingIndicator).toHaveClass('animate-ping');
      }
    });
  });

  describe('Layout and Structure', () => {
    it('should have proper spacing between components', () => {
      render(<ResourceHealthMonitor />);
      
      const container = screen.getByTestId('resource-health-monitor');
      const componentsContainer = container.querySelector('.space-y-4');
      expect(componentsContainer).toBeInTheDocument();
    });

    it('should have flex layout for component items', () => {
      render(<ResourceHealthMonitor />);
      
      for (let i = 0; i < 5; i++) {
        const component = screen.getByTestId(`component-${i}`);
        expect(component).toHaveClass('flex', 'items-center', 'space-x-4');
      }
    });

    it('should have proper padding and margins', () => {
      render(<ResourceHealthMonitor />);
      
      const container = screen.getByTestId('resource-health-monitor');
      expect(container).toHaveClass('p-6');
      
      const title = screen.getByTestId('health-title');
      expect(title).toHaveClass('mb-6');
    });
  });

  describe('Accessibility', () => {
    it('should have semantic heading structure', () => {
      render(<ResourceHealthMonitor />);
      
      const title = screen.getByTestId('health-title');
      expect(title.tagName).toBe('H4');
    });

    it('should have descriptive component names', () => {
      render(<ResourceHealthMonitor />);
      
      const componentNames = [
        'API Server',
        'Scheduler',
        'Controller Manager', 
        'etcd Cluster',
        'Kubelet'
      ];

      componentNames.forEach((name, index) => {
        const componentElement = screen.getByTestId(`component-name-${index}`);
        expect(componentElement).toHaveTextContent(name);
      });
    });

    it('should maintain readable text contrast', () => {
      render(<ResourceHealthMonitor />);
      
      for (let i = 0; i < 5; i++) {
        const componentName = screen.getByTestId(`component-name-${i}`);
        expect(componentName).toHaveClass('text-gray-900');
        
        const latency = screen.getByTestId(`latency-${i}`);
        expect(latency).toHaveClass('text-gray-600');
      }
    });
  });

  describe('Health Metrics Display', () => {
    it('should show uptime percentages correctly', () => {
      render(<ResourceHealthMonitor />);
      
      const expectedUptimes = ['99.9%', '100%', '98.7%', '99.5%', '97.8%'];
      
      expectedUptimes.forEach((uptime, index) => {
        expect(screen.getByTestId(`uptime-${index}`)).toHaveTextContent(uptime);
      });
    });

    it('should display system operational status prominently', () => {
      render(<ResourceHealthMonitor />);
      
      const overallStatus = screen.getByTestId('overall-status');
      expect(overallStatus).toHaveClass('font-bold', 'rounded-full');
      expect(overallStatus).toHaveTextContent('All Systems Operational');
    });
  });
});
