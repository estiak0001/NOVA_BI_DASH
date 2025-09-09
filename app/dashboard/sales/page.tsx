"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  Users,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const generateTimeSeriesData = (count: number, baseValue: number) => {
  const data = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    data.push([
      date.getTime(),
      Math.floor(Math.random() * (baseValue * 0.5)) + baseValue * 0.75,
    ]);
  }
  return data;
};

export default function SalesPage() {
  const [dateRange, setDateRange] = useState("30d");
  const [metric, setMetric] = useState("all");
  const [salesQtyAmt, setSalesQtyAmt] = useState([{ qty: 0, amt: 0 }]);
  const [salesOverTime, setSalesOverTime] = useState<
    { date: string; sales: number }[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/analytics/execute",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `SELECT SUM(qty) AS qty, SUM(sales) AS amt
                      FROM iceberg.kfg_analytics.fact_sales_v1`,
            }),
          },
        );

        const result = await response.json();
        setSalesQtyAmt(result);
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      }
    };

    fetchData();
  }, [dateRange, metric]);

  useEffect(() => {
    const fetchSalesOverTime = async () => {
      try {
        const intervals = {
          "7d": "7 days",
          "30d": "30 days",
          "90d": "90 days",
          "1y": "1 year",
        };
        const dateFilter = `WHERE dateinvoiced >= CURRENT_DATE - INTERVAL '${
          intervals[dateRange] || "30 days"
        }'`;
        const response = await fetch(
          "http://localhost:8000/analytics/execute",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `SELECT DATE_TRUNC('month', dateinvoiced) AS date, SUM(sales) AS sales
                      FROM iceberg.kfg_analytics.fact_sales_v1
                      GROUP BY DATE_TRUNC('month', dateinvoiced)
                      ORDER BY DATE_TRUNC('month', dateinvoiced)`,
            }),
          },
        );

        const result = await response.json();
        const formattedData = result
          .filter(
            (item: { date: string; sales: number }) =>
              item.date && item.sales != null,
          )
          .map((item: { date: string; sales: number }) => ({
            date: new Date(item.date).toISOString(),
            sales: Number(item.sales),
          }))
          .sort(
            (a: { date: string }, b: { date: string }) =>
              new Date(a.date).getTime() - new Date(b.date).getTime(),
          );
        setSalesOverTime(formattedData);
      } catch (error) {
        console.error("Error fetching sales over time:", error);
      }
    };

    fetchSalesOverTime();
  }, [dateRange, metric]);

  const salesAreaChartOptions = {
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const data = params[0];
        const date = new Date(data.data[0]).toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        return `${date}<br/>Sales: $${data.data[1].toLocaleString()}`;
      },
    },
    xAxis: {
      type: "time",
      boundaryGap: false,
      axisLabel: {
        color: "#6B7280",
        formatter: (value: number) => {
          return new Date(value).toLocaleString("default", {
            month: "short",
            year: "numeric",
          });
        },
      },
      minInterval: 30 * 24 * 60 * 60 * 1000, // Approx. 1 month
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#6B7280",
        formatter: (val: number) => `$${val.toLocaleString()}`,
      },
      splitLine: {
        lineStyle: {
          color: "#E5E7EB",
        },
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    series: [
      {
        name: "Sales",
        type: "line",
        smooth: true,
        areaStyle: {
          color: "rgba(59, 130, 246, 0.3)",
        },
        lineStyle: {
          color: "#3B82F6",
        },
        itemStyle: {
          color: "#3B82F6",
        },
        data:
          salesOverTime.length > 0
            ? salesOverTime.map((point) => [
                new Date(point.date).getTime(),
                point.sales,
              ])
            : generateTimeSeriesData(12, 10000),
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive sales analysis and insights
          </p>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sales Quantity
            </CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesQtyAmt[0].qty}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesQtyAmt[0].amt}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
            <CardDescription>Monthly sale trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts
              option={salesAreaChartOptions}
              notMerge={true}
              lazyUpdate={true}
              style={{ height: 350 }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
