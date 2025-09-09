"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  TrendingUp, 
  Users, 
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react"

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false })

// Dynamically import ECharts to avoid SSR issues
const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false })

// Sample data for different metrics
const generateTimeSeriesData = (count: number, baseValue: number) => {
  const data = []
  const now = new Date()
  for (let i = count; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    data.push([
      date.getTime(),
      Math.floor(Math.random() * (baseValue * 0.5)) + baseValue * 0.75
    ])
  }
  return data
}

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30d")
  const [metric, setMetric] = useState("all")
  const [_chartType, _setChartType] = useState("area")
  const [gaugeValue, setGaugeValue] = useState(78)

  // Update gauge value periodically to simulate real-time data
  useEffect(() => {
    const interval = setInterval(() => {
      setGaugeValue(prev => {
        const change = (Math.random() - 0.5) * 10
        const newValue = Math.max(0, Math.min(100, prev + change))
        return Math.round(newValue)
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Chart configurations
  const revenueChartConfig = {
    series: [{
      name: 'Revenue',
      data: generateTimeSeriesData(30, 5000)
    }, {
      name: 'Profit',
      data: generateTimeSeriesData(30, 3000)
    }],
    options: {
      chart: {
        type: 'area' as const,
        height: 350,
        zoom: { enabled: false },
        toolbar: { show: false }
      },
      colors: ['#3B82F6', '#10B981'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' as const, width: 2 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.3,
        }
      },
      xaxis: {
        type: 'datetime' as const,
        labels: { style: { colors: '#6B7280' } }
      },
      yaxis: {
        labels: { 
          style: { colors: '#6B7280' },
          formatter: (val: number) => `$${val.toLocaleString()}`
        }
      },
      grid: { borderColor: '#E5E7EB' },
      legend: { position: 'top' as const, horizontalAlign: 'left' as const }
    }
  }

  const userActivityConfig = {
    series: [
      {
        name: 'Active Users',
        data: [44, 55, 57, 56, 61, 58, 63, 60, 66, 69, 65, 72]
      },
      {
        name: 'New Users',
        data: [76, 85, 101, 98, 87, 105, 91, 114, 94, 115, 108, 122]
      }
    ],
    options: {
      chart: {
        type: 'bar' as const,
        height: 350,
        toolbar: { show: false }
      },
      colors: ['#8B5CF6', '#F59E0B'],
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 4
        }
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      xaxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        labels: { style: { colors: '#6B7280' } }
      },
      yaxis: {
        labels: { 
          style: { colors: '#6B7280' },
          formatter: (val: number) => `${val}k`
        }
      },
      fill: { opacity: 1 },
      legend: { position: 'top' as const, horizontalAlign: 'left' as const },
      grid: { borderColor: '#E5E7EB' }
    }
  }

  const deviceDistributionConfig = {
    series: [44, 55, 13, 43, 22],
    options: {
      chart: {
        type: 'donut' as const,
        height: 350
      },
      colors: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
      labels: ['Desktop', 'Mobile', 'Tablet', 'Smart TV', 'Others'],
      responsive: [{
        breakpoint: 480,
        options: {
          chart: { width: 200 },
          legend: { position: 'bottom' as const }
        }
      }],
      legend: { position: 'bottom' as const },
      dataLabels: {
        enabled: true,
        formatter: function (val: number) {
          return Math.round(val) + "%"
        }
      }
    }
  }

  const conversionFunnelConfig = {
    series: [{
      name: 'Conversions',
      data: [1000, 800, 600, 400, 200]
    }],
    options: {
      chart: {
        type: 'bar' as const,
        height: 350,
        toolbar: { show: false }
      },
      colors: ['#6366F1'],
      plotOptions: {
        bar: {
          horizontal: true,
          distributed: true,
          barHeight: '70%'
        }
      },
      dataLabels: {
        enabled: true,
        formatter: function (val: number) {
          return val.toLocaleString()
        }
      },
      xaxis: {
        categories: ['Page Views', 'Product Views', 'Add to Cart', 'Checkout', 'Purchase'],
        labels: { style: { colors: '#6B7280' } }
      },
      yaxis: {
        labels: { style: { colors: '#6B7280' } }
      },
      grid: { borderColor: '#E5E7EB' },
      legend: { show: false }
    }
  }

  const realTimeConfig = {
    series: [{
      name: 'Active Users',
      data: generateTimeSeriesData(20, 150).map(point => [point[0], point[1]])
    }],
    options: {
      chart: {
        type: 'line' as const,
        height: 200,
        animations: { enabled: true, easing: 'linear' as const, dynamicAnimation: { speed: 1000 } },
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      colors: ['#10B981'],
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' as const, width: 3 },
      xaxis: {
        type: 'datetime' as const,
        range: 1800000, // 30 minutes
        labels: { show: false }
      },
      yaxis: {
        labels: { 
          style: { colors: '#6B7280' },
          formatter: (val: number) => Math.round(val).toString()
        }
      },
      grid: { borderColor: '#E5E7EB' }
    }
  }

  // ECharts configurations
  const echartsGaugeOption = {
    tooltip: {
      formatter: '{a} <br/>{b} : {c}%'
    },
    series: [
      {
        name: 'Server Load',
        type: 'gauge',
        progress: {
          show: true,
          width: 18
        },
        axisLine: {
          lineStyle: {
            width: 18
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          length: 15,
          lineStyle: {
            width: 2,
            color: '#999'
          }
        },
        axisLabel: {
          distance: 25,
          color: '#999',
          fontSize: 12
        },
        anchor: {
          show: true,
          showAbove: true,
          size: 25,
          itemStyle: {
            borderWidth: 10
          }
        },
        title: {
          show: false
        },
        detail: {
          valueAnimation: true,
          fontSize: 24,
          offsetCenter: [0, '70%']
        },
        data: [
          {
            value: gaugeValue,
            name: 'CPU Usage'
          }
        ]
      }
    ]
  }

  const echartsRadarOption = {
    title: {
      text: 'Performance Metrics',
      left: 'center',
      textStyle: {
        fontSize: 16,
        color: '#374151'
      }
    },
    tooltip: {},
    radar: {
      indicator: [
        { name: 'Speed', max: 100 },
        { name: 'Reliability', max: 100 },
        { name: 'Security', max: 100 },
        { name: 'Usability', max: 100 },
        { name: 'Efficiency', max: 100 },
        { name: 'Scalability', max: 100 }
      ],
      radius: '60%'
    },
    series: [
      {
        name: 'Current vs Target',
        type: 'radar',
        data: [
          {
            value: [88, 92, 85, 79, 91, 86],
            name: 'Current Performance',
            itemStyle: {
              color: '#3B82F6'
            }
          },
          {
            value: [95, 98, 95, 90, 95, 92],
            name: 'Target Performance',
            itemStyle: {
              color: '#10B981'
            }
          }
        ]
      }
    ]
  }

  const echartsHeatmapOption = {
    title: {
      text: 'User Activity Heatmap',
      left: 'center',
      textStyle: {
        fontSize: 16,
        color: '#374151'
      }
    },
    tooltip: {
      position: 'top'
    },
    grid: {
      height: '50%',
      top: '15%'
    },
    xAxis: {
      type: 'category',
      data: ['12a', '1a', '2a', '3a', '4a', '5a', '6a', '7a', '8a', '9a', '10a', '11a',
             '12p', '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p', '10p', '11p'],
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: ['#e0f2fe', '#0288d1', '#01579b']
      }
    },
    series: [
      {
        name: 'Activity',
        type: 'heatmap',
        data: (() => {
          const data = []
          for (let i = 0; i < 7; i++) {
            for (let j = 0; j < 24; j++) {
              data.push([j, i, Math.floor(Math.random() * 100)])
            }
          }
          return data
        })(),
        label: {
          show: false
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }

  const echartsTreemapOption = {
    title: {
      text: 'Content Categories Distribution',
      left: 'center',
      textStyle: {
        fontSize: 16,
        color: '#374151'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%'
    },
    series: [
      {
        name: 'Content Distribution',
        type: 'treemap',
        data: [
          {
            name: 'Technology',
            value: 35,
            itemStyle: { color: '#3B82F6' }
          },
          {
            name: 'Business',
            value: 25,
            itemStyle: { color: '#10B981' }
          },
          {
            name: 'Health',
            value: 20,
            itemStyle: { color: '#F59E0B' }
          },
          {
            name: 'Education',
            value: 15,
            itemStyle: { color: '#EF4444' }
          },
          {
            name: 'Others',
            value: 5,
            itemStyle: { color: '#8B5CF6' }
          }
        ]
      }
    ]
  }

  const echartsSankeyOption = {
    title: {
      text: 'User Flow Diagram',
      left: 'center',
      textStyle: {
        fontSize: 16,
        color: '#374151'
      }
    },
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove'
    },
    series: [
      {
        type: 'sankey',
        data: [
          { name: 'Landing Page' },
          { name: 'Product Page' },
          { name: 'Cart' },
          { name: 'Checkout' },
          { name: 'Payment' },
          { name: 'Success' },
          { name: 'Exit' }
        ],
        links: [
          { source: 'Landing Page', target: 'Product Page', value: 1000 },
          { source: 'Landing Page', target: 'Exit', value: 200 },
          { source: 'Product Page', target: 'Cart', value: 600 },
          { source: 'Product Page', target: 'Exit', value: 400 },
          { source: 'Cart', target: 'Checkout', value: 450 },
          { source: 'Cart', target: 'Exit', value: 150 },
          { source: 'Checkout', target: 'Payment', value: 400 },
          { source: 'Checkout', target: 'Exit', value: 50 },
          { source: 'Payment', target: 'Success', value: 350 },
          { source: 'Payment', target: 'Exit', value: 50 }
        ],
        emphasis: {
          focus: 'adjacency'
        },
        lineStyle: {
          color: 'gradient',
          curveness: 0.5
        }
      }
    ]
  }

  // Dynamic line chart that responds to date range
  const generateDynamicData = () => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365
    const data = []
    for (let i = 0; i < days; i++) {
      data.push([i, Math.floor(Math.random() * 1000) + 500])
    }
    return data
  }

  const echartsDynamicLineOption = {
    title: {
      text: `Traffic Trends (${dateRange})`,
      left: 'center',
      textStyle: {
        fontSize: 16,
        color: '#374151'
      }
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: generateDynamicData().map((_, index) => `Day ${index + 1}`)
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: generateDynamicData().map(item => item[1]),
        type: 'line',
        smooth: true,
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(59, 130, 246, 0.8)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
            ]
          }
        },
        lineStyle: {
          color: '#3B82F6'
        }
      }
    ]
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive data analysis and insights</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={metric} onValueChange={setMetric}>
            <SelectTrigger className="w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Metrics</SelectItem>
              <SelectItem value="revenue">Revenue</SelectItem>
              <SelectItem value="users">Users</SelectItem>
              <SelectItem value="engagement">Engagement</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$145,231</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,350</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              +180.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <div className="p-2 bg-purple-100 rounded-lg">
              <PieChart className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4m 32s</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              +7% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Activity */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Real-time Activity</CardTitle>
            <CardDescription>Live user activity on your platform</CardDescription>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live
          </Badge>
        </CardHeader>
        <CardContent>
          <Chart
            options={realTimeConfig.options}
            series={realTimeConfig.series}
            type="line"
            height={200}
          />
        </CardContent>
      </Card>

      {/* Main Charts Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue & Profit Chart */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Revenue & Profit Analysis</CardTitle>
            <CardDescription>Monthly revenue and profit trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={revenueChartConfig.options}
              series={revenueChartConfig.series}
              type="area"
              height={350}
            />
          </CardContent>
        </Card>

        {/* User Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity</CardTitle>
            <CardDescription>Active and new users by month</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={userActivityConfig.options}
              series={userActivityConfig.series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Device Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Device Distribution</CardTitle>
            <CardDescription>User devices breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={deviceDistributionConfig.options}
              series={deviceDistributionConfig.series}
              type="donut"
              height={350}
            />
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>User journey from page view to purchase</CardDescription>
          </CardHeader>
          <CardContent>
            <Chart
              options={conversionFunnelConfig.options}
              series={conversionFunnelConfig.series}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>
      </div>

      {/* ECharts Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Advanced Analytics with ECharts</h2>
          <Badge variant="secondary">Interactive Charts</Badge>
        </div>

        {/* ECharts Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Server Performance Gauge */}
          <Card>
            <CardHeader>
              <CardTitle>Server Performance</CardTitle>
              <CardDescription>Real-time CPU usage monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <ReactECharts 
                option={echartsGaugeOption} 
                style={{ height: '300px' }}
                notMerge={true}
              />
            </CardContent>
          </Card>

          {/* Performance Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>System Metrics</CardTitle>
              <CardDescription>Multi-dimensional performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ReactECharts 
                option={echartsRadarOption} 
                style={{ height: '300px' }}
                notMerge={true}
              />
            </CardContent>
          </Card>

          {/* Content Distribution Treemap */}
          <Card>
            <CardHeader>
              <CardTitle>Content Analysis</CardTitle>
              <CardDescription>Category distribution breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ReactECharts 
                option={echartsTreemapOption} 
                style={{ height: '300px' }}
                notMerge={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Large ECharts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* User Activity Heatmap */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Patterns</CardTitle>
              <CardDescription>Hourly user activity across the week</CardDescription>
            </CardHeader>
            <CardContent>
              <ReactECharts 
                option={echartsHeatmapOption} 
                style={{ height: '400px' }}
                notMerge={true}
              />
            </CardContent>
          </Card>

          {/* User Flow Sankey Diagram */}
          <Card>
            <CardHeader>
              <CardTitle>User Journey</CardTitle>
              <CardDescription>Flow analysis from landing to conversion</CardDescription>
            </CardHeader>
            <CardContent>
              <ReactECharts 
                option={echartsSankeyOption} 
                style={{ height: '400px' }}
                notMerge={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Chart responding to filters */}
        <Card>
          <CardHeader>
            <CardTitle>Dynamic Traffic Analysis</CardTitle>
            <CardDescription>Real-time data visualization that responds to your filter selections</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts 
              option={echartsDynamicLineOption} 
              style={{ height: '350px' }}
              key={dateRange} // Force re-render when dateRange changes
              notMerge={true}
            />
          </CardContent>
        </Card>
      </div>

      {/* Additional Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { source: "Google Search", visitors: "45,231", percentage: "42%" },
                { source: "Direct", visitors: "32,150", percentage: "31%" },
                { source: "Social Media", visitors: "18,942", percentage: "18%" },
                { source: "Email", visitors: "9,876", percentage: "9%" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.source}</p>
                    <p className="text-xs text-muted-foreground">{item.visitors} visitors</p>
                  </div>
                  <Badge variant="outline">{item.percentage}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { country: "United States", users: "12,345", flag: "🇺🇸" },
                { country: "United Kingdom", users: "8,901", flag: "🇬🇧" },
                { country: "Germany", users: "6,789", flag: "🇩🇪" },
                { country: "France", users: "4,567", flag: "🇫🇷" },
                { country: "Canada", users: "3,210", flag: "🇨🇦" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{item.flag}</span>
                    <div>
                      <p className="text-sm font-medium">{item.country}</p>
                      <p className="text-xs text-muted-foreground">{item.users} users</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { metric: "Page Load Time", value: "1.2s", trend: "+5%" },
                { metric: "Bounce Rate", value: "2.3%", trend: "-8%" },
                { metric: "Time on Site", value: "4m 32s", trend: "+12%" },
                { metric: "Pages per Session", value: "3.7", trend: "+3%" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{item.metric}</p>
                    <p className="text-lg font-bold">{item.value}</p>
                  </div>
                  <Badge variant={item.trend.startsWith('+') ? 'default' : 'secondary'}>
                    {item.trend}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
