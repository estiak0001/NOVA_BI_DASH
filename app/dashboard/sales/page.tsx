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
import { Download, RefreshCw, TrendingUp } from "lucide-react";

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

export default function SalesPage() {
  // Filters
  const [salesOffice, setSalesOffice] = useState("all");
  const [region, setRegion] = useState("all");
  const [territory, setTerritory] = useState("all");
  const [product, setProduct] = useState("all");
  const [category, setCategory] = useState("all");
  const [group, setGroup] = useState("all");
  const [metric, setMetric] = useState<"qty" | "sales">("qty");
  const [salesOfficeOptions, setSalesOfficeOptions] = useState<string[]>([]);
  const [regionOptions, setRegionOptions] = useState<string[]>([]);
  const [territoryOptions, setTerritoryOptions] = useState<string[]>([]);
  const [productOptions, setProductOptions] = useState<string[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [groupOptions, setGroupOptions] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: new Date(new Date().setMonth(new Date().getMonth() - 12)),
    to: new Date(),
  });

  // Data states
  const [salesQtyAmt, setSalesQtyAmt] = useState([{ qty: 0, amt: 0 }]);
  const [avgUnitPrice, setAvgUnitPrice] = useState([{ price: 0 }]);
  const [avgDailySales, setAvgDailySales] = useState([{ amt: 0 }]);
  const [salesByOffice, setSalesByOffice] = useState<
    { sales_office: string; value: number }[]
  >([]);
  const [salesByCategoryOffice, setSalesByCategoryOffice] = useState<
    { sales_office: string; category: string; value: number }[]
  >([]);
  const [salesByGroup, setSalesByGroup] = useState<
    { group: string; value: number }[]
  >([]);
  const [topProducts, setTopProducts] = useState<
    { product: string; value: number }[]
  >([]);
  const [salesOverTime, setSalesOverTime] = useState<
    { date: string; value: number }[]
  >([]);

  // Fetch filter options
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [
          salesOfficeResponse,
          regionResponse,
          territoryResponse,
          productResponse,
          categoryResponse,
          groupResponse,
        ] = await Promise.all([
          api.post(
            "/analytics/execute",
            JSON.stringify({
              query: `SELECT distinct(sales_office) as sales_office
                      FROM iceberg.kfg_analytics.fact_sales_v1`,
            }),
          ),
          api.post(
            "/analytics/execute",
            JSON.stringify({
              query: `SELECT distinct(region) as region
                      FROM iceberg.kfg_analytics.fact_sales_v1`,
            }),
          ),
          api.post(
            "/analytics/execute",
            JSON.stringify({
              query: `SELECT distinct(territory) as territory
                      FROM iceberg.kfg_analytics.fact_sales_v1`,
            }),
          ),
          api.post(
            "/analytics/execute",
            JSON.stringify({
              query: `SELECT distinct(product_name) as product
                      FROM iceberg.kfg_analytics.fact_sales_v1`,
            }),
          ),
          api.post(
            "/analytics/execute",
            JSON.stringify({
              query: `SELECT distinct(category_name) as category
                      FROM iceberg.kfg_analytics.fact_sales_v1`,
            }),
          ),
          api.post(
            "/analytics/execute",
            JSON.stringify({
              query: `SELECT distinct("group") as "group"
                      FROM iceberg.kfg_analytics.fact_sales_v1`,
            }),
          ),
        ]);

        setSalesOfficeOptions(
          salesOfficeResponse.data.map(
            (item: { sales_office: string }) => item.sales_office,
          ),
        );
        setRegionOptions(
          regionResponse.data.map((item: { region: string }) => item.region),
        );
        setTerritoryOptions(
          territoryResponse.data.map(
            (item: { territory: string }) => item.territory,
          ),
        );
        setProductOptions(
          productResponse.data.map((item: { product: string }) => item.product),
        );
        setCategoryOptions(
          categoryResponse.data.map(
            (item: { category: string }) => item.category,
          ),
        );
        setGroupOptions(
          groupResponse.data.map((item: { group: string }) => item.group),
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

  // Construct WHERE clause for filters
  const getWhereClause = () => {
    const conditions: string[] = [];

    if (salesOffice !== "all") {
      conditions.push(`sales_office = '${salesOffice}'`);
    }
    if (region !== "all") {
      conditions.push(`region = '${region}'`);
    }
    if (territory !== "all") {
      conditions.push(`territory = '${territory}'`);
    }
    if (product !== "all") {
      conditions.push(`product_name = '${product}'`);
    }
    if (category !== "all") {
      conditions.push(`category_name = '${category}'`);
    }
    if (group !== "all") {
      conditions.push(`"group" = '${group}'`);
    }
    if (dateRange.from && dateRange.to) {
      conditions.push(
        `dateinvoiced BETWEEN DATE '${formatDateForTrino(dateRange.from)}' AND DATE '${formatDateForTrino(dateRange.to)}'`,
      );
    }

    return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  };

  // Fetch total sales quantity and amount
  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const whereClause = getWhereClause();
        const response = await api.post(
          "/analytics/execute",
          JSON.stringify({
            query: `SELECT SUM(qty) as qty, SUM(sales) as amt
                    FROM iceberg.kfg_analytics.fact_sales_v1
                    ${whereClause}`,
          }),
        );
        setSalesQtyAmt(response.data);
      } catch (error) {
        console.error("Failed to fetch sales data:", error);
      }
    };

    fetchSalesData();
  }, [salesOffice, region, territory, product, category, group, dateRange]);

  // Fetch average unit price
  useEffect(() => {
    const fetchAvgUnitPrice = async () => {
      try {
        const whereClause = getWhereClause();
        const response = await api.post(
          "/analytics/execute",
          JSON.stringify({
            query: `SELECT SUM(sales) / NULLIF(SUM(qty), 0) as price
                    FROM iceberg.kfg_analytics.fact_sales_v1
                    ${whereClause}`,
          }),
        );
        setAvgUnitPrice(response.data);
      } catch (error) {
        console.error("Failed to fetch average unit price:", error);
      }
    };

    fetchAvgUnitPrice();
  }, [salesOffice, region, territory, product, category, group, dateRange]);

  // Fetch average daily sales amount
  useEffect(() => {
    const fetchAvgDailySales = async () => {
      try {
        const whereClause = getWhereClause();
        const response = await api.post(
          "/analytics/execute",
          JSON.stringify({
            query: `SELECT SUM(sales) / NULLIF(COUNT(DISTINCT DATE(dateinvoiced)), 0) as amt
                    FROM iceberg.kfg_analytics.fact_sales_v1
                    ${whereClause}`,
          }),
        );
        setAvgDailySales(response.data);
      } catch (error) {
        console.error("Failed to fetch average daily sales:", error);
      }
    };

    fetchAvgDailySales();
  }, [salesOffice, region, territory, product, category, group, dateRange]);

  // Fetch sales by office
  useEffect(() => {
    const fetchSalesByOffice = async () => {
      try {
        const whereClause = getWhereClause();
        const metricColumn = metric === "qty" ? "qty" : "sales";
        const response = await api.post(
          "/analytics/execute",
          JSON.stringify({
            query: `SELECT sales_office, SUM(${metricColumn}) as value
                    FROM iceberg.kfg_analytics.fact_sales_v1
                    ${whereClause}
                    GROUP BY sales_office`,
          }),
        );
        setSalesByOffice(response.data);
      } catch (error) {
        console.error("Failed to fetch sales by office:", error);
      }
    };

    fetchSalesByOffice();
  }, [
    salesOffice,
    region,
    territory,
    product,
    category,
    group,
    dateRange,
    metric,
  ]);

  // Fetch sales by category and office
  useEffect(() => {
    const fetchSalesByCategoryOffice = async () => {
      try {
        const whereClause = getWhereClause();
        const metricColumn = metric === "qty" ? "qty" : "sales";
        const response = await api.post(
          "/analytics/execute",
          JSON.stringify({
            query: `SELECT sales_office, category_name as category, SUM(${metricColumn}) as value
                    FROM iceberg.kfg_analytics.fact_sales_v1
                    ${whereClause}
                    GROUP BY sales_office, category_name`,
          }),
        );
        setSalesByCategoryOffice(response.data);
      } catch (error) {
        console.error("Failed to fetch sales by category and office:", error);
      }
    };

    fetchSalesByCategoryOffice();
  }, [
    salesOffice,
    region,
    territory,
    product,
    category,
    group,
    dateRange,
    metric,
  ]);

  // Fetch sales by group
  useEffect(() => {
    const fetchSalesByGroup = async () => {
      try {
        const whereClause = getWhereClause();
        const metricColumn = metric === "qty" ? "qty" : "sales";
        const response = await api.post(
          "/analytics/execute",
          JSON.stringify({
            query: `SELECT "group", SUM(${metricColumn}) as value
                    FROM iceberg.kfg_analytics.fact_sales_v1
                    ${whereClause}
                    GROUP BY "group"`,
          }),
        );
        setSalesByGroup(response.data);
      } catch (error) {
        console.error("Failed to fetch sales by group:", error);
      }
    };

    fetchSalesByGroup();
  }, [
    salesOffice,
    region,
    territory,
    product,
    category,
    group,
    dateRange,
    metric,
  ]);

  // Fetch top 10 products
  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        const whereClause = getWhereClause();
        const metricColumn = metric === "qty" ? "qty" : "sales";
        const response = await api.post(
          "/analytics/execute",
          JSON.stringify({
            query: `SELECT product_name as product, SUM(${metricColumn}) as value
                    FROM iceberg.kfg_analytics.fact_sales_v1
                    ${whereClause}
                    GROUP BY product_name
                    ORDER BY value DESC LIMIT 10`,
          }),
        );
        setTopProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch top products:", error);
      }
    };

    fetchTopProducts();
  }, [
    salesOffice,
    region,
    territory,
    product,
    category,
    group,
    dateRange,
    metric,
  ]);

  // Fetch sales over time
  useEffect(() => {
    const fetchSalesOverTime = async () => {
      try {
        const whereClause = getWhereClause();
        const metricColumn = metric === "qty" ? "qty" : "sales";
        const response = await api.post(
          "/analytics/execute",
          JSON.stringify({
            query: `SELECT DATE_TRUNC('month', dateinvoiced) AS date, SUM(${metricColumn}) AS value
                    FROM iceberg.kfg_analytics.fact_sales_v1
                    ${whereClause}
                    GROUP BY DATE_TRUNC('month', dateinvoiced)
                    ORDER BY DATE_TRUNC('month', dateinvoiced)`,
          }),
        );
        const formattedData = response.data
          .filter(
            (item: { date: string; value: number }) =>
              item.date && item.value != null,
          )
          .map((item: { date: string; value: number }) => ({
            date: new Date(item.date).toISOString(),
            value: Number(item.value),
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
  }, [
    salesOffice,
    region,
    territory,
    product,
    category,
    group,
    dateRange,
    metric,
  ]);

  // Download report function
  async function downloadReport(reportType: "default" | "monthly" | "weekly") {
    try {
      // Construct query parameters from the current filter state
      const params = new URLSearchParams();
      if (salesOffice !== "all") params.append("sales_office", salesOffice);
      if (region !== "all") params.append("region", region);
      if (territory !== "all") params.append("territory", territory);
      if (product !== "all") params.append("product", product);
      if (category !== "all") params.append("category", category);
      if (group !== "all") params.append("group", group);
      if (dateRange.from)
        params.append("date_from", formatDateForTrino(dateRange.from));
      if (dateRange.to)
        params.append("date_to", formatDateForTrino(dateRange.to));
      params.append("metric", metric);

      // Determine report endpoint and filename based on report type
      const reportId =
        reportType === "default" ? "1" : reportType === "monthly" ? "2" : "3";
      const reportName = `sales_report_${reportType}.xlsx`;

      // Make the API call with query parameters
      const response = await api.get(
        `/reports/sales/download/${reportId}?${params.toString()}`,
        {
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = reportName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Error downloading the ${reportType} report:`, error);
    }
  }

  // Chart options
  const categories = [
    ...new Set(salesByCategoryOffice.map((item) => item.category)),
  ];
  const offices = [
    ...new Set(salesByCategoryOffice.map((item) => item.sales_office)),
  ];

  const salesSplineChartOptions = {
    tooltip: {
      trigger: "axis",
      formatter: (params: any) => {
        const data = params[0];
        const date = new Date(data.data[0]).toLocaleString("default", {
          month: "short",
          year: "numeric",
        });
        return `${date}<br/>${metric === "qty" ? "Quantity" : "Amount"}: ${data.data[1].toLocaleString()}`;
      },
    },
    xAxis: {
      type: "time",
      boundaryGap: false,
      axisLabel: {
        color: "#4B5563",
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
        color: "#4B5563",
        formatter: (val: number) => `${val.toLocaleString()}`,
      },
      splitLine: {
        lineStyle: {
          color: "#D1D5DB",
        },
      },
    },
    grid: {
      left: "5%",
      right: "5%",
      bottom: "5%",
      containLabel: true,
    },
    series: [
      {
        name: metric === "qty" ? "Quantity" : "Amount",
        type: "line",
        smooth: true,
        lineStyle: {
          color: "#10B981",
          width: 3,
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(16, 185, 129, 0.5)" },
              { offset: 1, color: "rgba(16, 185, 129, 0.1)" },
            ],
          },
        },
        itemStyle: {
          color: "#10B981",
        },
        data:
          salesOverTime.length > 0
            ? salesOverTime.map((point) => [
                new Date(point.date).getTime(),
                point.value,
              ])
            : generateTimeSeriesData(12, metric === "qty" ? 10000 : 100000),
      },
    ],
  };

  const salesDonutChartOptions = {
    tooltip: {
      trigger: "item",
      formatter: `{a} <br/>{b}: {c} (${metric === "qty" ? "units" : "%"})`,
    },
    legend: {
      orient: "horizontal",
      bottom: "0%",
      textStyle: { color: "#4B5563" },
      type: "scroll", // Enable scrollable/paginated legend
      pageButtonItemGap: 5, // Gap between page buttons and legend items
      pageButtonGap: 10, // Gap between page buttons
      pageButtonPosition: "end", // Position of pagination buttons (start/end)
      pageFormatter: "{current}/{total}", // Format for page number display
      pageIconSize: 12, // Size of pagination icons
      pageIconColor: "#4B5563", // Color of pagination icons
      pageIconInactiveColor: "#D1D5DB", // Color of inactive pagination icons
      pageTextStyle: {
        color: "#4B5563", // Color of page number text
      },
      itemWidth: 25, // Width of legend items
      itemHeight: 14, // Height of legend items
      height: 40, // Limit legend height to trigger pagination
      selector: true, // Show select all/none buttons (optional)
    },
    series: [
      {
        name: metric === "qty" ? "Sales Quantity" : "Sales Amount",
        type: "pie",
        radius: ["40%", "70%"], // Donut chart with inner radius
        data:
          salesByOffice.length > 0
            ? salesByOffice.map((item) => ({
                name: item.sales_office,
                value: Number(item.value),
              }))
            : [{ name: "No Data", value: 0 }],
        color: ["#8B5CF6", "#A78BFA", "#C4B5FD", "#DDD6FE"],
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

  const salesClusteredBarChartOptions = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow",
      },
      formatter: (params) => {
        const office = params[0].axisValue;
        let tooltip = `${office}<br/>`;
        params.forEach((param) => {
          tooltip += `${param.seriesName}: ${param.value.toLocaleString()}<br/>`;
        });
        return tooltip;
      },
    },
    legend: {
      orient: "horizontal",
      top: "0%",
      textStyle: { color: "#4B5563" },
      data: categories,
    },
    grid: {
      left: "5%",
      right: "5%",
      bottom: "5%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: offices.length > 0 ? offices : ["No Data"],
      axisLabel: {
        color: "#4B5563",
        rotate: offices.length > 5 ? 45 : 0,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        color: "#4B5563",
        formatter: (val) => `${val.toLocaleString()}`,
      },
      splitLine: {
        lineStyle: {
          color: "#D1D5DB",
        },
      },
    },
    color: ["#F97316", "#FB923C", "#FDBA74", "#F7E5B7"],
    series:
      salesByCategoryOffice.length > 0
        ? categories.map((category) => ({
            name: category,
            type: "bar",
            barGap: "0%", // No gap between bars of different categories
            data: offices.map((office) => {
              const item = salesByCategoryOffice.find(
                (d) => d.sales_office === office && d.category === category,
              );
              return item ? Number(item.value) : 0;
            }),
          }))
        : [
            {
              name: "No Data",
              type: "bar",
              data: [0],
            },
          ],
  };

  const salesRoseChartOptions = {
    tooltip: {
      trigger: "item",
      formatter: `{a} <br/>{b}: {c} (${metric === "qty" ? "units" : "%"})`,
    },
    legend: {
      orient: "vertical",
      right: "0%",
      textStyle: { color: "#4B5563" },
    },
    series: [
      {
        name:
          metric === "qty"
            ? "Sales by Group (Quantity)"
            : "Sales by Group (Amount)",
        type: "pie",
        radius: ["20%", "55%"],
        roseType: "area", // Nightingale rose chart
        data:
          salesByGroup.length > 0
            ? salesByGroup.map((item) => ({
                name: item.group,
                value: Number(item.value),
              }))
            : [{ name: "No Data", value: 0 }],
        color: ["#14B8A6", "#2DD4BF", "#5FEAD1", "#99F6E4"],
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

  // Calculate max value for progress bars in top products
  const maxProductValue =
    topProducts.length > 0
      ? Math.max(...topProducts.map((item) => item.value))
      : 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive sales analysis and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="flex flex-col gap-2">
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => downloadReport("default")}
                >
                  Default Report
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => downloadReport("monthly")}
                >
                  Monthly Report
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => downloadReport("weekly")}
                >
                  Weekly Report
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Sales Office
          </label>
          <Select value={salesOffice} onValueChange={setSalesOffice}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Offices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Offices</SelectItem>
              {salesOfficeOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Region
          </label>
          <Select value={region} onValueChange={setRegion}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              {regionOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Territory
          </label>
          <Select value={territory} onValueChange={setTerritory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Territories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Territories</SelectItem>
              {territoryOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
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
              {productOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
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
              {categoryOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Group
          </label>
          <Select value={group} onValueChange={setGroup}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="All Groups" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {groupOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Metric
          </label>
          <Select
            value={metric}
            onValueChange={(value: "qty" | "sales") => setMetric(value)}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select Metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="qty">Quantity</SelectItem>
              <SelectItem value="sales">Amount</SelectItem>
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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-bold">Key Metrics</CardTitle>
          <div className="p-2 bg-green-100 rounded-lg">
            <TrendingUp className="h-4 w-4 text-green-600" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700">
                Sales Amount
              </div>
              <div className="text-xl font-bold text-green-800">
                {salesQtyAmt[0].amt.toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700">
                Sales Quantity
              </div>
              <div className="text-xl font-bold text-blue-800">
                {salesQtyAmt[0].qty.toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700">
                Avg Unit Price
              </div>
              <div className="text-xl font-bold text-purple-800">
                {avgUnitPrice[0].price.toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <div className="text-sm font-medium text-gray-700">
                Avg Sales/Day
              </div>
              <div className="text-xl font-bold text-orange-800">
                {avgDailySales[0].amt.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>
              Monthly {metric === "qty" ? "Sales Quantity" : "Sales Amount"}
            </CardTitle>
            <CardDescription>
              Monthly {metric === "qty" ? "quantity" : "amount"} trends over
              time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReactECharts
              option={salesSplineChartOptions}
              notMerge={true}
              lazyUpdate={true}
              style={{ height: 350 }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              {metric === "qty" ? "Sales Quantity" : "Sales Amount"} by Office
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts
              option={salesDonutChartOptions}
              notMerge={true}
              lazyUpdate={true}
              style={{ height: 350 }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              {metric === "qty" ? "Sales Quantity" : "Sales Amount"} by Category
              and Office
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts
              option={salesClusteredBarChartOptions}
              notMerge={true}
              lazyUpdate={true}
              style={{ height: 350 }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              {metric === "qty" ? "Sales Quantity" : "Sales Amount"} by Group
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts
              option={salesRoseChartOptions}
              notMerge={true}
              lazyUpdate={true}
              style={{ height: 350 }}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>
              Top 10 Products by{" "}
              {metric === "qty" ? "Sales Quantity" : "Sales Amount"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-500">
                <thead className="bg-amber-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th scope="col" className="px-4 py-3">
                      #
                    </th>
                    <th scope="col" className="px-4 py-3">
                      Product
                    </th>
                    <th scope="col" className="px-4 py-3">
                      {metric === "qty" ? "Quantity" : "Amount"}
                    </th>
                    {/*<th scope="col" className="px-4 py-3">
                      Progress
                    </th>*/}
                  </tr>
                </thead>
                <tbody>
                  {topProducts.length > 0 ? (
                    topProducts.map((item, index) => (
                      <tr
                        key={item.product}
                        className={`border-b ${
                          index % 2 === 0 ? "bg-amber-50" : "bg-white"
                        } hover:bg-amber-100 transition`}
                      >
                        <td className="px-4 py-2">{index + 1}</td>
                        <td className="px-4 py-2">{item.product}</td>
                        <td className="px-4 py-2">
                          {item.value.toLocaleString()}
                        </td>
                        {/*<td className="px-4 py-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-amber-400 h-2.5 rounded-full"
                              style={{
                                width: `${
                                  (item.value / maxProductValue) * 100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </td>*/}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-2" colSpan={4}>
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
