
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Filter, MapPin, Clock } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { canteens } from "@/data/mockData";

// Define filters
interface FiltersState {
  search: string;
  isOpen: boolean | null;
  sortBy: string;
}

const Canteens = () => {
  const [filters, setFilters] = useState<FiltersState>({
    search: "",
    isOpen: null,
    sortBy: "popularity",
  });

  // Filter canteens based on current filters
  const filteredCanteens = canteens.filter((canteen) => {
    // Filter by search term
    if (
      filters.search &&
      !canteen.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !canteen.description.toLowerCase().includes(filters.search.toLowerCase()) &&
      !canteen.location.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Filter by open status
    if (filters.isOpen !== null && canteen.isOpen !== filters.isOpen) {
      return false;
    }

    return true;
  });

  // Sort canteens based on current sort option
  const sortedCanteens = [...filteredCanteens].sort((a, b) => {
    switch (filters.sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "name":
        return a.name.localeCompare(b.name);
      case "popularity":
        // Since we don't have a popularity field, we'll use rating as a proxy
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  return (
    <MainLayout>
      <div className="py-6">
        <h1 className="text-3xl font-bold mb-6">Campus Canteens</h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search canteens..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          {/* Filter */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Canteens</SheetTitle>
                <SheetDescription>
                  Customize your search for campus canteens.
                </SheetDescription>
              </SheetHeader>

              <div className="py-4 space-y-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Open Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="open"
                        checked={filters.isOpen === true}
                        onCheckedChange={() =>
                          setFilters({
                            ...filters,
                            isOpen: filters.isOpen === true ? null : true,
                          })
                        }
                      />
                      <Label htmlFor="open">Open Now</Label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-3">Sort By</h3>
                  <Select
                    value={filters.sortBy}
                    onValueChange={(value) =>
                      setFilters({ ...filters, sortBy: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sorting" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popularity">Popularity</SelectItem>
                      <SelectItem value="rating">Rating</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <Button
                  onClick={() =>
                    setFilters({
                      search: "",
                      isOpen: null,
                      sortBy: "popularity",
                    })
                  }
                  variant="outline"
                  className="w-full"
                >
                  Reset Filters
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          {/* Sort */}
          <Select
            value={filters.sortBy}
            onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="name">Name (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {sortedCanteens.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-500">No canteens found</h3>
            <p className="text-gray-400 mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCanteens.map((canteen) => (
              <Link
                key={canteen.id}
                to={`/canteen/${canteen.id}`}
                className="transition-transform hover:scale-[1.02]"
              >
                <Card className="overflow-hidden h-full flex flex-col">
                  <div className="h-48 relative">
                    <img
                      src={canteen.image}
                      alt={canteen.name}
                      className="h-full w-full object-cover"
                    />
                    {!canteen.isOpen && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive">Closed</Badge>
                      </div>
                    )}
                    {canteen.isOpen && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="success">Open</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="py-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold">{canteen.name}</h3>
                    <div className="flex items-center text-gray-500 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{canteen.location}</span>
                    </div>
                    <div className="flex items-center text-gray-500 mt-1">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">
                        {canteen.openTime} - {canteen.closeTime}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                      {canteen.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(canteen.rating)
                                  ? "text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="ml-1 text-sm font-medium">
                          {canteen.rating}
                        </span>
                      </div>
                      <Button size="sm">View Menu</Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Canteens;
