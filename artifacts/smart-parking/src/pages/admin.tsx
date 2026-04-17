import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Car,
  MapPin,
  IndianRupee,
  Activity,
  Plus,
  Map,
  ShieldCheck,
  Zap,
  MoreVertical,
  Pencil,
  Trash2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import {
  useGetParkingSummary,
  useListParkingLocations,
  useCreateParkingLocation,
  useUpdateParkingLocation,
  useDeleteParkingLocation,
  useListBookings,
  useUpdateBooking,
  getGetParkingSummaryQueryKey,
  getListParkingLocationsQueryKey,
  getListBookingsQueryKey
} from "@workspace/api-client-react";
import type { ParkingLocationInput, ParkingLocationUpdate, BookingUpdate, VehicleType, BookingStatus } from "@workspace/api-client-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Navbar } from "@/components/layout/navbar";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900/50 flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 md:px-8 py-8 flex-1 max-w-7xl">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900 dark:text-white">Operator Portal</h1>
            <p className="text-muted-foreground mt-1">Manage parking locations and active bookings</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white dark:bg-gray-900 p-1 border">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6 m-0">
            <OverviewTab />
          </TabsContent>
          
          <TabsContent value="locations" className="space-y-6 m-0">
            <LocationsTab />
          </TabsContent>
          
          <TabsContent value="bookings" className="space-y-6 m-0">
            <BookingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function OverviewTab() {
  const { data: summary, isLoading } = useGetParkingSummary();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i}><CardContent className="p-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Today's Revenue</p>
                <p className="text-3xl font-bold font-mono text-primary mt-2">₹{summary.todayRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg"><IndianRupee className="h-5 w-5 text-primary" /></div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Bookings</p>
                <p className="text-3xl font-bold mt-2">{summary.activeBookings}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg"><Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Available Slots</p>
                <p className="text-3xl font-bold mt-2 text-green-600">{summary.availableSlots} <span className="text-lg text-muted-foreground font-normal">/ {summary.totalSlots}</span></p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg"><Car className="h-5 w-5 text-green-600 dark:text-green-400" /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Locations</p>
                <p className="text-3xl font-bold mt-2">{summary.totalLocations}</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg"><MapPin className="h-5 w-5 text-orange-600 dark:text-orange-400" /></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>City Breakdown</CardTitle>
            <CardDescription>Available slots and locations by city</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.cityBreakdown.map((city) => (
                <div key={city.city} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Map className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{city.city}</span>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span className="text-muted-foreground">{city.locations} lots</span>
                    <span className="font-bold text-green-600 w-16 text-right">{city.availableSlots} free</span>
                  </div>
                </div>
              ))}
              {summary.cityBreakdown.length === 0 && (
                <p className="text-sm text-muted-foreground">No data available.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Bookings</CardTitle>
            <CardDescription>Latest activity across all locations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.recentBookings.map((booking) => (
                <div key={booking.id} className="flex justify-between items-center border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium text-sm">{booking.vehicleNumber} <span className="text-muted-foreground font-normal">at {booking.locationName}</span></p>
                    <p className="text-xs text-muted-foreground">{format(new Date(booking.startTime), 'MMM d, h:mm a')} • {booking.durationHours} hrs</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium font-mono text-sm text-primary">₹{booking.amount}</p>
                    <Badge variant={booking.status === 'active' ? 'default' : 'outline'} className="text-[10px] h-4 mt-1 px-1">
                      {booking.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {summary.recentBookings.length === 0 && (
                <p className="text-sm text-muted-foreground">No recent bookings.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function LocationsTab() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<any>(null);

  const { data: locations, isLoading } = useListParkingLocations();

  const createMutation = useCreateParkingLocation({
    mutation: {
      onSuccess: () => {
        toast.success("Location added successfully");
        setIsAddOpen(false);
        queryClient.invalidateQueries({ queryKey: getListParkingLocationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetParkingSummaryQueryKey() });
      },
      onError: () => toast.error("Failed to add location")
    }
  });

  const updateMutation = useUpdateParkingLocation({
    mutation: {
      onSuccess: () => {
        toast.success("Location updated successfully");
        setEditingLocation(null);
        queryClient.invalidateQueries({ queryKey: getListParkingLocationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetParkingSummaryQueryKey() });
      },
      onError: () => toast.error("Failed to update location")
    }
  });

  const deleteMutation = useDeleteParkingLocation({
    mutation: {
      onSuccess: () => {
        toast.success("Location deleted successfully");
        queryClient.invalidateQueries({ queryKey: getListParkingLocationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetParkingSummaryQueryKey() });
      },
      onError: () => toast.error("Failed to delete location")
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Parking Locations</CardTitle>
          <CardDescription>Manage your parking lots and available slots</CardDescription>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> Add Location
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Location</DialogTitle>
              <DialogDescription>Create a new parking lot in your network.</DialogDescription>
            </DialogHeader>
            <LocationForm 
              onSubmit={(data) => createMutation.mutate({ data })} 
              isPending={createMutation.isPending} 
              onCancel={() => setIsAddOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Slots (Avail/Total)</TableHead>
                <TableHead>Rate/Hr</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8"><Skeleton className="h-8 w-full max-w-sm mx-auto" /></TableCell>
                </TableRow>
              ) : locations?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No locations found. Add one to get started.</TableCell>
                </TableRow>
              ) : locations?.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{location.name}</p>
                    <p className="text-xs text-muted-foreground">{location.area}, {location.city}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">{location.vehicleType}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${location.availableSlots === 0 ? 'text-destructive' : 'text-green-600'}`}>
                        {location.availableSlots}
                      </span>
                      <span className="text-muted-foreground">/ {location.totalSlots}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">₹{location.hourlyRate}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setEditingLocation(location)}>
                          <Pencil className="h-4 w-4 mr-2" /> Edit Location
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            if(confirm("Are you sure you want to delete this location?")) {
                              deleteMutation.mutate({ id: location.id });
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={!!editingLocation} onOpenChange={(open) => !open && setEditingLocation(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>Update details for {editingLocation?.name}.</DialogDescription>
          </DialogHeader>
          {editingLocation && (
            <LocationForm 
              initialData={editingLocation}
              onSubmit={(data) => updateMutation.mutate({ id: editingLocation.id, data })} 
              isPending={updateMutation.isPending} 
              onCancel={() => setEditingLocation(null)}
              isEdit
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function BookingsTab() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  const { data: bookings, isLoading } = useListBookings(
    statusFilter !== "all" ? { status: statusFilter as any } : {},
    { query: { queryKey: getListBookingsQueryKey(statusFilter !== "all" ? { status: statusFilter as any } : {}) } }
  );

  const updateMutation = useUpdateBooking({
    mutation: {
      onSuccess: () => {
        toast.success("Booking updated");
        queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListParkingLocationsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetParkingSummaryQueryKey() });
      },
      onError: () => toast.error("Failed to update booking")
    }
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>All Bookings</CardTitle>
          <CardDescription>View and manage customer reservations</CardDescription>
        </div>
        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="active">Active (Parked)</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Vehicle</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Time & Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8"><Skeleton className="h-8 w-full max-w-sm mx-auto" /></TableCell>
                </TableRow>
              ) : bookings?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No bookings found.</TableCell>
                </TableRow>
              ) : bookings?.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <p className="font-medium text-sm">{booking.userName}</p>
                    <p className="text-xs text-muted-foreground">{booking.phone}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-sm">{booking.vehicleNumber}</p>
                    <p className="text-xs text-muted-foreground capitalize">{booking.vehicleType}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-sm">{booking.locationName}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{format(new Date(booking.startTime), 'MMM d, h:mm a')}</p>
                    <p className="text-xs text-muted-foreground">{booking.durationHours} hrs</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      booking.status === 'active' ? 'default' : 
                      booking.status === 'confirmed' ? 'secondary' :
                      booking.status === 'completed' ? 'outline' : 'destructive'
                    }>
                      {booking.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {booking.status === 'confirmed' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                        onClick={() => updateMutation.mutate({ id: booking.id, data: { status: 'active' as BookingStatus } })}
                        disabled={updateMutation.isPending}
                      >
                        Mark Active
                      </Button>
                    )}
                    {booking.status === 'active' && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-green-600 border-green-200 hover:bg-green-50"
                        onClick={() => updateMutation.mutate({ id: booking.id, data: { status: 'completed' as BookingStatus } })}
                        disabled={updateMutation.isPending}
                      >
                        Complete
                      </Button>
                    )}
                    {(booking.status === 'confirmed') && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="ml-2 text-destructive"
                        onClick={() => {
                          if(confirm("Cancel this booking?")) {
                            updateMutation.mutate({ id: booking.id, data: { status: 'cancelled' as BookingStatus } })
                          }
                        }}
                        disabled={updateMutation.isPending}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function LocationForm({ 
  initialData, 
  onSubmit, 
  isPending, 
  onCancel,
  isEdit = false
}: { 
  initialData?: any, 
  onSubmit: (data: ParkingLocationInput) => void, 
  isPending: boolean, 
  onCancel: () => void,
  isEdit?: boolean
}) {
  const [formData, setFormData] = useState<ParkingLocationInput>(initialData ? {
    name: initialData.name,
    city: initialData.city,
    area: initialData.area,
    address: initialData.address,
    landmark: initialData.landmark,
    operatorName: initialData.operatorName,
    totalSlots: initialData.totalSlots,
    availableSlots: initialData.availableSlots,
    hourlyRate: initialData.hourlyRate,
    vehicleType: initialData.vehicleType,
    openTime: initialData.openTime,
    closeTime: initialData.closeTime,
    securityAvailable: initialData.securityAvailable,
    evCharging: initialData.evCharging,
  } : {
    name: "",
    city: "",
    area: "",
    address: "",
    landmark: "",
    operatorName: "",
    totalSlots: 50,
    availableSlots: 50,
    hourlyRate: 40,
    vehicleType: "car" as VehicleType,
    openTime: "08:00:00",
    closeTime: "22:00:00",
    securityAvailable: false,
    evCharging: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2 col-span-2 md:col-span-1">
          <Label htmlFor="name">Location Name</Label>
          <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="space-y-2 col-span-2 md:col-span-1">
          <Label htmlFor="operatorName">Operator Name</Label>
          <Input id="operatorName" required value={formData.operatorName} onChange={(e) => setFormData({...formData, operatorName: e.target.value})} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="area">Area / Locality</Label>
          <Input id="area" required value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Full Address</Label>
        <Input id="address" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="vehicleType">Vehicle Type</Label>
          <Select value={formData.vehicleType} onValueChange={(val: any) => setFormData({...formData, vehicleType: val})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="car">Car</SelectItem>
              <SelectItem value="bike">Bike</SelectItem>
              <SelectItem value="auto">Auto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="hourlyRate">Hourly Rate (₹)</Label>
          <Input id="hourlyRate" type="number" min="0" required value={formData.hourlyRate} onChange={(e) => setFormData({...formData, hourlyRate: parseInt(e.target.value, 10)})} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="totalSlots">Total Slots</Label>
          <Input id="totalSlots" type="number" min="1" required value={formData.totalSlots} onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            setFormData(prev => ({...prev, totalSlots: val, availableSlots: isEdit ? prev.availableSlots : val}))
          }} />
        </div>
      </div>

      {isEdit && (
        <div className="space-y-2 w-1/3">
          <Label htmlFor="availableSlots">Available Slots (Override)</Label>
          <Input id="availableSlots" type="number" min="0" max={formData.totalSlots} required value={formData.availableSlots} onChange={(e) => setFormData({...formData, availableSlots: parseInt(e.target.value, 10)})} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="openTime">Open Time</Label>
          <Input id="openTime" type="time" required value={formData.openTime.slice(0,5)} onChange={(e) => setFormData({...formData, openTime: e.target.value + ":00"})} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="closeTime">Close Time</Label>
          <Input id="closeTime" type="time" required value={formData.closeTime.slice(0,5)} onChange={(e) => setFormData({...formData, closeTime: e.target.value + ":00"})} />
        </div>
      </div>

      <div className="flex gap-6 pt-2">
        <div className="flex items-center space-x-2">
          <Checkbox id="security" checked={formData.securityAvailable} onCheckedChange={(checked) => setFormData({...formData, securityAvailable: !!checked})} />
          <Label htmlFor="security" className="font-normal cursor-pointer">Security Guard Available</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="ev" checked={formData.evCharging} onCheckedChange={(checked) => setFormData({...formData, evCharging: !!checked})} />
          <Label htmlFor="ev" className="font-normal cursor-pointer">EV Charging Station</Label>
        </div>
      </div>

      <DialogFooter className="pt-6">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEdit ? "Update Location" : "Create Location"}
        </Button>
      </DialogFooter>
    </form>
  );
}
