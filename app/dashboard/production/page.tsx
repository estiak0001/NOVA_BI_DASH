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
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Download, RefreshCw, BarChart3, PieChart } from "lucide-react";

import api from "@/lib/api";

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
  const [warehouse, setWarehouse] = useState("all");
  const [locator, setLocator] = useState("all");
  const [product, setProduct] = useState("all");
  const [category, setCategory] = useState("all");
  const [productGroup, setProductGroup] = useState("all");
  const [orgOptions, setOrgOptions] = useState<string[]>([]);
  const [warehouseOptions, setWarehouseOptions] = useState<string[]>([]);
  const [locatorOptions, setLocatorOptions] = useState<string[]>([]);
  const [productOptions, setProductOptions] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [productGroupOptions, setProductGroupOptions] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 12)),
    to: new Date(),
  });

  const [salesQtyAmt, setSalesQtyAmt] = useState([{ qty: 0, amt: 0 }]);
  const [avgDailyProductionQty, setAvgDailyProductionQty] = useState([
    { qty: 0 },
  ]);
  const [totalProductionQty, setTotalProductionQty] = useState([{ qty: 0 }]);
  const [openingQty, setOpeningQty] = useState([{ opening: 0 }]);
  const [closingQty, setClosingQty] = useState([{ closing: 0 }]);
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
        const [
          orgResponse,
          warehouseResponse,
          locatorResponse,
          productResponse,
          categoryResponse,
          productGroupResponse,
        ] = await Promise.all([
          api.post(
            "/analytics/execute",
            JSON.stringify({
              query: `SELECT distinct(organization) as org
                      FROM iceberg.kfg_analytics.production_qty_info`,
            }),
          ),
          api.post(
            "/analytics/execute",
            JSON.stringify({
              query: `SELECT distinct(warehouse_name) as warehouse
                      FROM iceberg.kfg_analytics.production_qty_info`,
            }),
          ),
          api.post(
            "/analytics/execute",
            JSON.stringify({
              query: `SELECT distinct(locator_name) as locator
                      FROM iceberg.kfg_analytics.production_qty_info`,
            }),
          ),
          api.post(
            "/analytics/execute",
            JSON.stringify({
              query: `SELECT distinct(product) as product
                      FROM iceberg.kfg_analytics.production_qty_info`,
            }),
          ),
          api.post(
            "/analytics/execute",
            JSON.stringify({
              query: `SELECT distinct(category) as category
                      FROM iceberg.kfg_analytics.production_qty_info`,
            }),
          ),
          api.post(
            "/analytics/execute",
            JSON.stringify({
              query: `SELECT distinct(product_group) as product_group
                      FROM iceberg.kfg_analytics.production_qty_info`,
            }),
          ),
        ]);

        setOrgOptions(
          orgResponse.data.map((item: { org: string }) => item.org),
        );
        setWarehouseOptions(
          warehouseResponse.data.map(
            (item: { warehouse: string }) => item.warehouse,
          ),
        );
        setLocatorOptions(
          locatorResponse.data.map((item: { locator: string }) => item.locator),
        );
        setProductOptions(
          productResponse.data.map((item: { product: string }) => item.product),
        );
        setCategoryOptions(
          categoryResponse.data.map(
            (item: { category: string }) => item.category,
          ),
        );
        setProductGroupOptions(
          productGroupResponse.data.map(
            (item: { product_group: string }) => item.product_group,
          ),
        );
      } catch (error) {
        console.error("Failed to fetch filters:", error);
      }
    };

    fetchFilters();
  }, []);

  // Helper function to format date for Trino queries
  const formatDateForTrino = (date: Date | undefined) => {
    if (!date) return "";
    return format(date, "yyyy-MM-dd");
  };

  // Construct combined WHERE clause for all filters
  const getWhereClause = () => {
    const conditions: string[] = [];

    if (org !== "all") {
      conditions.push(`organization = '${org}'`);
    }
    if (warehouse !== "all") {
      conditions.push(`warehouse_name = '${warehouse}'`);
    }
    if (locator !== "all") {
      conditions.push(`locator_name = '${locator}'`);
    }
    if (product !== "all") {
      conditions.push(`product = '${product}'`);
    }
    if (category !== "all") {
      conditions.push(`category = '${category}'`);
    }
    if (productGroup !== "all") {
      conditions.push(`product_group = '${productGroup}'`);
    }
    if (dateRange.from && dateRange.to) {
      conditions.push(
        `date BETWEEN DATE '${formatDateForTrino(dateRange.from)}' AND DATE '${formatDateForTrino(dateRange.to)}'`,
      );
    }

    return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const whereClause = getWhereClause();

        const response = await api.post(
          "/analytics/execute",
          JSON.stringify({
            query: `WITH LatestRecords AS (
                        SELECT
                          organization,
                          opening_qty,
                          ROW_NUMBER() OVER (PARTITION BY organization ORDER BY date DESC) AS rn
                        FROM iceberg.kfg_analytics.opening_and_closing_qty_info
                        ${whereClause}
                      )
                      SELECT
                        SUM(opening_qty) AS opening
                      FROM LatestRecords
                      WHERE rn = 1`,
          }),
        );

        const result = response.data;
        setOpeningQty(result);
      } catch (error) {
        console.error("Failed to fetch opening quantity data:", error);
      }
    };

    fetchData();
  }, [org, warehouse, locator, product, category, productGroup, dateRange]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const whereClause = getWhereClause();

        const response = await api.post(
          "/analytics/execute",
          JSON.stringify({
            query: `WITH LatestRecords AS (
                        SELECT
                          organization,
                          closing_qty,
                          ROW_NUMBER() OVER (PARTITION BY organization ORDER BY date DESC) AS rn
                        FROM iceberg.kfg_analytics.opening_and_closing_qty_info
                        ${whereClause}
                      )
                      SELECT
                        SUM(closing_qty) AS closing
                      FROM LatestRecords
                      WHERE rn = 1`,
          }),
        );

        const result = response.data;
        setClosingQty(result);
      } catch (error) {
        console.error("Failed to fetch closing quantity data:", error);
      }
    };

    fetchData();
  }, [org, warehouse, locator, product, category, productGroup, dateRange]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const whereClause = getWhereClause();

        const response = await api.post(
          "/analytics/execute",
          JSON.stringify({
            query: `SELECT SUM(qty)/count(distinct date(date)) as qty
                      FROM iceberg.kfg_analytics.production_qty_info
                      ${whereClause}`,
          }),
        );

        const result = response.data;
        setAvgDailyProductionQty(result);
      } catch (error) {
        console.error("Failed to fetch average daily production data:", error);
      }
    };

    fetchData();
  }, [org, warehouse, locator, product, category, productGroup, dateRange]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const whereClause = getWhereClause();

        const response = await api.post(
          "/analytics/execute",
          JSON.stringify({
            query: `SELECT SUM(qty) AS qty
                      FROM iceberg.kfg_analytics.production_qty_info
                      ${whereClause}`,
          }),
        );

        const result = response.data;
        setTotalProductionQty(result);
      } catch (error) {
        console.error("Failed to fetch total production data:", error);
      }
    };

    fetchData();
  }, [org, warehouse, locator, product, category, productGroup, dateRange]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const whereClause = getWhereClause();

        const response = await api.post(
          "/analytics/execute",
          JSON.stringify({
            query: `SELECT
              organization as org,
              sum(qty) as qty
              FROM iceberg.kfg_analytics.production_qty_info
              ${whereClause}
              GROUP BY organization`,
          }),
        );

        const result = response.data;
        setProdByOrg(result);
      } catch (error) {
        console.error("Failed to fetch production by org data:", error);
      }
    };

    fetchData();
  }, [org, warehouse, locator, product, category, productGroup, dateRange]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const whereClause = getWhereClause();

        const response = await api.post(
          "/analytics/execute",
          JSON.stringify({
            query: `SELECT
              product_group as "group",
              sum(qty) as qty
              FROM iceberg.kfg_analytics.internal_qty_info
              ${whereClause}
              GROUP BY product_group`,
          }),
        );

        const result = response.data;
        setInternalByGrp(result);
      } catch (error) {
        console.error("Failed to fetch internal group data:", error);
      }
    };

    fetchData();
  }, [org, warehouse, locator, product, category, productGroup, dateRange]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const whereClause = getWhereClause();

        const response = await api.post(
          "/analytics/execute",
          JSON.stringify({
            query: `SELECT
              organization as org,
              category as cat,
              sum(qty) as qty
              FROM iceberg.kfg_analytics.production_qty_info
              ${whereClause}
              GROUP BY organization, category`,
          }),
        );

        const result = response.data;
        setProdByCatOrg(result);
      } catch (error) {
        console.error("Failed to fetch production by category data:", error);
      }
    };

    fetchData();
  }, [org, warehouse, locator, product, category, productGroup, dateRange]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const whereClause = getWhereClause();

        const response = await api.post(
          "/analytics/execute",
          JSON.stringify({
            query: `SELECT
              product,
              sum(qty) as qty
              FROM iceberg.kfg_analytics.production_qty_info
              ${whereClause}
              GROUP BY product ORDER BY qty DESC LIMIT 10`,
          }),
        );

        const result = response.data;
        setTopByProdQty(result);
      } catch (error) {
        console.error("Failed to fetch top products data:", error);
      }
    };

    fetchData();
  }, [org, warehouse, locator, product, category, productGroup, dateRange]);

  useEffect(() => {
    const fetchProductionOverTime = async () => {
      try {
        const whereClause = getWhereClause();

        const response = await api.post(
          "/analytics/execute",
          JSON.stringify({
            query: `SELECT DATE_TRUNC('month', date) AS date, SUM(qty) AS qty
                      FROM iceberg.kfg_analytics.production_qty_info
                      ${whereClause}
                      GROUP BY DATE_TRUNC('month', date)
                      ORDER BY DATE_TRUNC('month', date)`,
          }),
        );

        const result = response.data;
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
  }, [org, warehouse, locator, product, category, productGroup, dateRange]);

  async function download_report() {
    try {
      const response = await api.get("/reports/production/download/1", {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "output.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("File downloaded successfully");
    } catch (error) {
      console.error("Error downloading the report:", error);
      throw error;
    }
  }

  const categories = [...new Set(prodByCatOrg.map((item) => item.cat))];
  const organizations = [...new Set(prodByCatOrg.map((item) => item.org))];

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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={download_report}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Organization
          </label>
          <Select value={org} onValueChange={setOrg}>
            <SelectTrigger className="w-[140px]">
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
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Warehouse
          </label>
          <Select value={warehouse} onValueChange={setWarehouse}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Warehouses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Warehouses</SelectItem>
              {warehouseOptions.map((warehouseOption) => (
                <SelectItem key={warehouseOption} value={warehouseOption}>
                  {warehouseOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Locator
          </label>
          <Select value={locator} onValueChange={setLocator}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Locators" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locators</SelectItem>
              {locatorOptions.map((locatorOption) => (
                <SelectItem key={locatorOption} value={locatorOption}>
                  {locatorOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Product
          </label>
          <Select value={product} onValueChange={setProduct}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Products" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Products</SelectItem>
              {productOptions.map((productOption) => (
                <SelectItem key={productOption} value={productOption}>
                  {productOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categoryOptions.map((categoryOption) => (
                <SelectItem key={categoryOption} value={categoryOption}>
                  {categoryOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Product Group
          </label>
          <Select value={productGroup} onValueChange={setProductGroup}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Product Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Product Groups</SelectItem>
              {productGroupOptions.map((productGroupOption) => (
                <SelectItem key={productGroupOption} value={productGroupOption}>
                  {productGroupOption}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Date Range
          </label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from && dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  if (range) {
                    setDateRange({
                      from: range.from,
                      to: range.to,
                    });
                  }
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
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
            <div className="text-2xl font-bold">{openingQty[0].opening}</div>
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
            <div className="text-2xl font-bold">{closingQty[0].closing}</div>
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
            <div className="text-2xl font-bold">
              {totalProductionQty[0].qty}
            </div>
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
            <div className="text-2xl font-bold">
              {avgDailyProductionQty[0].qty}
            </div>
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
