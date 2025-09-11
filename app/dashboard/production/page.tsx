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

export default function ProductionPage() {
  // filters

  const [org, setOrg] = useState("all");
  const [metric, setMetric] = useState("all");
  const [orgOptions, setOrgOptions] = useState<string[]>([]);

  const [salesQtyAmt, setSalesQtyAmt] = useState([{ qty: 0, amt: 0 }]);
  const [productionOverTime, setProductionOverTime] = useState<
    { date: string; qty: number }[]
  >([]);
  const [prodByOrg, setProdByOrg] = useState<{ org: string; qty: number }[]>(
    [],
  );
  const [prodByCatOrg, setProdByCatOrg] = useState<
    { org: string; cat: string; qty: number }[]
  >([]);
  const [internalByGrp, setInternalByGrp] = useState<
    { group: string; qty: number }[]
  >([]);
  const [topByProdQty, setTopByProdQty] = useState<
    { product: string; qty: number }[]
  >([]);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await fetch(
          "http://localhost:8000/analytics/execute",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `SELECT distinct(organization) as org
                      FROM iceberg.kfg_analytics.production_qty_info`,
            }),
          },
        );

        const result = await response.json();
        setOrgOptions(result.map((item: { org: string }) => item.org));
      } catch (error) {
        console.error("Failed to fetch organization filters:", error);
      }
    };

    fetchFilters();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgFilter = org !== "all" ? `WHERE organization = '${org}'` : "";
        const response = await fetch(
          "http://localhost:8000/analytics/execute",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `SELECT SUM(qty) AS qty, SUM(sales) AS amt
                      FROM iceberg.kfg_analytics.fact_sales_v1
                      ${orgFilter}`,
            }),
          },
        );

        const result = await response.json();
        setSalesQtyAmt(result);
      } catch (error) {
        console.error("Failed to fetch sales data:", error);
      }
    };

    fetchData();
  }, [metric, org]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgFilter = org !== "all" ? `WHERE organization = '${org}'` : "";
        const response = await fetch(
          "http://localhost:8000/analytics/execute",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `SELECT
              organization as org,
              sum(qty) as qty
              FROM iceberg.kfg_analytics.production_qty_info
              ${orgFilter}
              GROUP BY organization`,
            }),
          },
        );

        const result = await response.json();
        setProdByOrg(result);
      } catch (error) {
        console.error("Failed to fetch production by org data:", error);
      }
    };

    fetchData();
  }, [metric, org]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgFilter = org !== "all" ? `WHERE organization = '${org}'` : "";
        const response = await fetch(
          "http://localhost:8000/analytics/execute",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `SELECT
              product_group as "group",
              sum(qty) as qty
              FROM iceberg.kfg_analytics.internal_qty_info
              ${orgFilter}
              GROUP BY product_group`,
            }),
          },
        );

        const result = await response.json();
        setInternalByGrp(result);
      } catch (error) {
        console.error("Failed to fetch internal group data:", error);
      }
    };

    fetchData();
  }, [metric, org]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgFilter = org !== "all" ? `WHERE organization = '${org}'` : "";
        const response = await fetch(
          "http://localhost:8000/analytics/execute",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `SELECT
              organization as org,
              category as cat,
              sum(qty) as qty
              FROM iceberg.kfg_analytics.production_qty_info
              ${orgFilter}
              GROUP BY organization, category`,
            }),
          },
        );

        const result = await response.json();
        setProdByCatOrg(result);
      } catch (error) {
        console.error("Failed to fetch production by category data:", error);
      }
    };

    fetchData();
  }, [metric, org]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const orgFilter = org !== "all" ? `WHERE organization = '${org}'` : "";
        const response = await fetch(
          "http://localhost:8000/analytics/execute",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `SELECT
              product,
              sum(qty) as qty
              FROM iceberg.kfg_analytics.production_qty_info
              ${orgFilter}
              GROUP BY product ORDER BY qty DESC LIMIT 10`,
            }),
          },
        );

        const result = await response.json();
        setTopByProdQty(result);
      } catch (error) {
        console.error("Failed to fetch top products data:", error);
      }
    };

    fetchData();
  }, [metric, org]);

  useEffect(() => {
    const fetchProductionOverTime = async () => {
      try {
        const orgFilter = org !== "all" ? `WHERE organization = '${org}'` : "";
        const response = await fetch(
          "http://localhost:8000/analytics/execute",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `SELECT DATE_TRUNC('month', date) AS date, SUM(qty) AS qty
                      FROM iceberg.kfg_analytics.production_qty_info
                      ${orgFilter}
                      GROUP BY DATE_TRUNC('month', date)
                      ORDER BY DATE_TRUNC('month', date)`,
            }),
          },
        );

        const result = await response.json();
        const formattedData = result
          .filter(
            (item: { date: string; qty: number }) =>
              item.date && item.qty != null,
          )
          .map((item: { date: string; qty: number }) => ({
            date: new Date(item.date).toISOString(),
            qty: Number(item.qty),
          }))
          .sort(
            (a: { date: string }, b: { date: string }) =>
              new Date(a.date).getTime() - new Date(b.date).getTime(),
          );
        setProductionOverTime(formattedData);
      } catch (error) {
        console.error("Error fetching production over time:", error);
      }
    };

    fetchProductionOverTime();
  }, [metric, org]);

  // Get unique categories
  const categories = [...new Set(prodByCatOrg.map((item) => item.cat))];

  // Get unique organizations
  const organizations = [...new Set(prodByCatOrg.map((item) => item.org))];

  // Create series data for each organization
  const series = organizations.map((org) => ({
    name: org,
    type: "bar",
    stack: "total",
    data: categories.map((cat) => {
      const item = prodByCatOrg.find((d) => d.org === org && d.cat === cat);
      return item ? Number(item.qty) : 0;
    }),
  }));

  const productionAreaChartOptions = {
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const data = params[0];
        const date = new Date(data.data[0]).toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        return `${date}<br/>Production: ${data.data[1].toLocaleString()}`;
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
      minInterval: 30 * 24 * 60 * 60 * 1000,
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#6B7280",
        formatter: (val: number) => `${val.toLocaleString()}`,
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
        name: "Production",
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
          productionOverTime.length > 0
            ? productionOverTime.map((point) => [
                new Date(point.date).getTime(),
                point.qty,
              ])
            : generateTimeSeriesData(12, 10000),
      },
    ],
  };

  const prodPieChartOptions = {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "Production Quantity",
        type: "pie",
        radius: "50%",
        data:
          prodByOrg.length > 0
            ? prodByOrg.map((item) => ({
                name: item.org,
                value: Number(item.qty),
              }))
            : [{ name: "No Data", value: 0 }],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  const internalByGroupPieChartOptions = {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "Quantity",
        type: "pie",
        radius: "50%",
        data:
          internalByGrp.length > 0
            ? internalByGrp.map((item) => ({
                name: item.group,
                value: Number(item.qty),
              }))
            : [{ name: "No Data", value: 0 }],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  const prodStackBarChartOptions = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params) => {
        const category = params[0].name;
        let tooltip = `${category}<br/>`;
        params.forEach((param) => {
          tooltip += `${param.seriesName}: ${param.value.toLocaleString()}<br/>`;
        });
        return tooltip;
      },
    },
    legend: {
      orient: "vertical",
      left: "left",
      data: organizations,
    },
    grid: {
      left: "10%",
      right: "4%",
      bottom: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: categories.length > 0 ? categories : ["No Data"],
      axisLabel: {
        color: "#6B7280",
        rotate: categories.length > 5 ? 45 : 0,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#6B7280",
        formatter: (val) => `${val.toLocaleString()}`,
      },
      splitLine: {
        lineStyle: {
          color: "#E5E7EB",
        },
      },
    },
    color: [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#EC4899",
      "#6EE7B7",
    ],
    series:
      prodByCatOrg.length > 0
        ? organizations.map((org) => ({
            name: org,
            type: "bar",
            stack: "total",
            data: categories.map((cat) => {
              const item = prodByCatOrg.find(
                (d) => d.org === org && d.cat === cat,
              );
              return item ? Number(item.qty) : 0;
            }),
          }))
        : [
            {
              name: "No Data",
              type: "bar",
              stack: "total",
              data: [0],
            },
          ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Production Dashboard
          </h1>
          <p className="text-muted-foreground">
            Comprehensive production analysis and insights
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={org} onValueChange={setOrg}>
            <SelectTrigger className="w-[140px]">
              <Users className="h-4 w-4 mr-2" />
              <SelectValue placeholder="All Organizations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Organizations</SelectItem>
              {orgOptions.map((orgOption) => (
                <SelectItem key={orgOption} value={orgOption}>
                  {orgOption}
                </SelectItem>
              ))}
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
              Opening Quantity
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
            <CardTitle className="text-sm font-medium">
              Closing Quantity
            </CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesQtyAmt[0].amt}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Production
            </CardTitle>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{salesQtyAmt[0].amt}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg production/day
            </CardTitle>
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
            <CardTitle>Monthly Production</CardTitle>
            <CardDescription>
              Monthly production trends over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts
              option={productionAreaChartOptions}
              notMerge={true}
              lazyUpdate={true}
              style={{ height: 350 }}
            />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Production by organization</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts
              option={prodPieChartOptions}
              notMerge={true}
              lazyUpdate={true}
              style={{ height: 350 }}
            />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Production by category and organization</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts
              option={prodStackBarChartOptions}
              notMerge={true}
              lazyUpdate={true}
              style={{ height: 350 }}
            />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Internal Cull/Mort/Comp by Product Group</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts
              option={internalByGroupPieChartOptions}
              notMerge={true}
              lazyUpdate={true}
              style={{ height: 350 }}
            />
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Top 10 Products by Production</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-500">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      #
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Product
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Quantity
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topByProdQty.length > 0 ? (
                    topByProdQty.map((item, index) => (
                      <tr
                        key={item.product}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{item.product}</td>
                        <td className="px-4 py-2">
                          {item.qty.toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-2" colSpan={3}>
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
