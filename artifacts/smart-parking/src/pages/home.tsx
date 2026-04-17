import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  MapPin,
  Car,
  Bike,
  Clock,
  IndianRupee,
  Search,
  CheckCircle2,
  Phone,
  CreditCard,
  Banknote,
  Ticket,
  ShieldCheck
} from "lucide-react";
import {
  useListParkingLocations,
  useCreateBooking,
  useListBookings,
  getListBookingsQueryKey,
  getListParkingLocationsQueryKey
} from "@workspace/api-client-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

import { Navbar } from "@/components/layout/navbar";

export default function Home() {
  const [city, setCity] = useState("");
  const [vehicleType, setVehicleType] = useState<string>("all");
  const [searchPhone, setSearchPhone] = useState("");
  const [activeTab, setActiveTab] = useState("find");

  const { data: locations, isLoading: isLoadingLocations } = useListParkingLocations(
    {
      ...(city ? { city } : {}),
      ...(vehicleType !== "all" ? { vehicleType: vehicleType as any } : {}),
    },
    { query: { queryKey: getListParkingLocationsQueryKey({ city, vehicleType: vehicleType as any }) } }
  );

  const { data: myBookings, isLoading: isLoadingBookings } = useListBookings(
    { phone: searchPhone },
    {
      query: {
        enabled: searchPhone.length >= 10,
        queryKey: getListBookingsQueryKey({ phone: searchPhone }),
      },
    }
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* Hero Section */}
      <section className="bg-primary/5 py-12 md:py-20">
        <div className="container px-4 md:px-8 mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 space-y-6">
              <Badge className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1 text-sm font-medium rounded-full">
                Available in 15+ Indian Cities
              </Badge>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight font-display text-gray-900 dark:text-white leading-tight">
                Find secure parking in crowded metros, <span className="text-primary">instantly.</span>
              </h1>
              <p className="text-lg text-muted-foreground md:max-w-[80%]">
                Whether you drive a car, ride a bike, or pilot an auto, we guarantee you a spot. Book ahead, pay securely, and skip the circling.
              </p>
            </div>
            <div className="flex-1 w-full max-w-md">
              <Card className="border-2 shadow-xl">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 rounded-t-lg rounded-b-none border-b h-14">
                    <TabsTrigger value="find" className="text-base font-medium h-full rounded-none">Find Spot</TabsTrigger>
                    <TabsTrigger value="manage" className="text-base font-medium h-full rounded-none">My Bookings</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="find" className="p-6 m-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City / Area</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="city"
                          placeholder="e.g. Mumbai, Koramangala..."
                          className="pl-9"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Vehicle Type</Label>
                      <Select value={vehicleType} onValueChange={setVehicleType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Vehicles</SelectItem>
                          <SelectItem value="car">Car (4 Wheeler)</SelectItem>
                          <SelectItem value="bike">Bike (2 Wheeler)</SelectItem>
                          <SelectItem value="auto">Auto (3 Wheeler)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="manage" className="p-6 m-0 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="10-digit mobile number"
                          className="pl-9"
                          maxLength={10}
                          value={searchPhone}
                          onChange={(e) => setSearchPhone(e.target.value)}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Enter the phone number used during booking</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12 container mx-auto px-4 md:px-8 max-w-6xl">
        {activeTab === "find" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold font-display">
                {city ? `Parking near "${city}"` : "Popular Parking Locations"}
              </h2>
              {locations && (
                <span className="text-muted-foreground">{locations.length} locations found</span>
              )}
            </div>

            {isLoadingLocations ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="overflow-hidden">
                    <Skeleton className="h-32 w-full rounded-none" />
                    <CardContent className="p-4 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : locations?.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50/50 dark:bg-gray-900/50">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No locations found</h3>
                <p className="text-muted-foreground">Try searching for a different city or vehicle type.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locations?.map((location) => (
                  <LocationCard key={location.id} location={location} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "manage" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold font-display">Your Bookings</h2>
            
            {searchPhone.length < 10 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50/50 dark:bg-gray-900/50">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">Enter your phone number</h3>
                <p className="text-muted-foreground">We'll fetch your active and past bookings.</p>
              </div>
            ) : isLoadingBookings ? (
               <div className="space-y-4">
               {[1, 2].map((i) => (
                 <Card key={i}>
                   <CardContent className="p-4">
                     <Skeleton className="h-6 w-1/4 mb-2" />
                     <Skeleton className="h-4 w-1/2" />
                   </CardContent>
                 </Card>
               ))}
             </div>
            ) : myBookings?.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50/50 dark:bg-gray-900/50">
                <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium">No bookings found</h3>
                <p className="text-muted-foreground">We couldn't find any bookings for +91 {searchPhone}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myBookings?.map((booking) => (
                  <Card key={booking.id} className="overflow-hidden">
                    <div className={`h-2 w-full ${
                      booking.status === 'active' ? 'bg-primary' : 
                      booking.status === 'confirmed' ? 'bg-blue-500' :
                      booking.status === 'completed' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{booking.locationName}</CardTitle>
                          <CardDescription>{booking.area}, {booking.city}</CardDescription>
                        </div>
                        <Badge variant={
                          booking.status === 'active' ? 'default' : 
                          booking.status === 'confirmed' ? 'secondary' :
                          booking.status === 'completed' ? 'outline' : 'destructive'
                        }>
                          {booking.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                      <div className="grid grid-cols-2 gap-y-3 text-sm">
                        <div>
                          <span className="text-muted-foreground block text-xs">Vehicle</span>
                          <div className="font-medium flex items-center gap-1">
                            {booking.vehicleType === 'car' ? <Car className="h-3 w-3" /> : 
                             booking.vehicleType === 'bike' ? <Bike className="h-3 w-3" /> : null}
                            {booking.vehicleNumber}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">Time</span>
                          <div className="font-medium">
                            {format(new Date(booking.startTime), 'MMM d, h:mm a')}
                          </div>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">Duration</span>
                          <div className="font-medium">{booking.durationHours} hrs</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-xs">Amount</span>
                          <div className="font-medium flex items-center">
                            <IndianRupee className="h-3 w-3" /> {booking.amount}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function LocationCard({ location }: { location: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    userName: "",
    phone: "",
    vehicleNumber: "",
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    durationHours: "1",
    paymentMode: "upi" as "upi" | "cash"
  });

  const createBooking = useCreateBooking({
    mutation: {
      onSuccess: () => {
        toast.success("Booking confirmed!");
        setIsOpen(false);
        // Refresh locations to update slots
        queryClient.invalidateQueries({ queryKey: getListParkingLocationsQueryKey() });
        if (formData.phone) {
          queryClient.invalidateQueries({ queryKey: getListBookingsQueryKey({ phone: formData.phone }) });
        }
        setFormData({
          userName: "",
          phone: "",
          vehicleNumber: "",
          startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
          durationHours: "1",
          paymentMode: "upi"
        });
      },
      onError: (error) => {
        toast.error("Failed to book slot");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userName || !formData.phone || !formData.vehicleNumber) {
      toast.error("Please fill all required fields");
      return;
    }
    
    createBooking.mutate({
      data: {
        locationId: location.id,
        userName: formData.userName,
        phone: formData.phone,
        vehicleNumber: formData.vehicleNumber.toUpperCase(),
        vehicleType: location.vehicleType,
        startTime: new Date(formData.startTime).toISOString(),
        durationHours: parseInt(formData.durationHours, 10),
        paymentMode: formData.paymentMode
      }
    });
  };

  const isFull = location.availableSlots === 0;

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
          <div>
            <CardTitle className="line-clamp-1">{location.name}</CardTitle>
            <CardDescription className="line-clamp-1 mt-1">
              {location.area}, {location.city}
            </CardDescription>
          </div>
          <div className="p-2 bg-primary/10 rounded-md text-primary shrink-0">
            {location.vehicleType === 'car' ? <Car className="h-5 w-5" /> : 
             location.vehicleType === 'bike' ? <Bike className="h-5 w-5" /> : 
             <Car className="h-5 w-5" />}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <div className="flex flex-wrap gap-2">
          {location.securityAvailable && (
             <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-300 border-none">
               <ShieldCheck className="h-3 w-3 mr-1" /> Security
             </Badge>
          )}
          {location.evCharging && (
             <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900 dark:text-blue-300 border-none">
               EV Charging
             </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              <Clock className="h-3 w-3" /> Timings
            </span>
            <span className="font-medium">{location.openTime.slice(0,5)} - {location.closeTime.slice(0,5)}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs flex items-center gap-1">
              <IndianRupee className="h-3 w-3" /> Hourly Rate
            </span>
            <span className="font-medium font-mono text-lg text-primary">₹{location.hourlyRate}</span>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Available Slots</span>
            <span className={`font-bold ${isFull ? 'text-destructive' : 'text-green-600'}`}>
              {location.availableSlots} / {location.totalSlots}
            </span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full ${isFull ? 'bg-destructive' : 'bg-green-500'}`} 
              style={{ width: `${Math.max(5, (location.availableSlots / location.totalSlots) * 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full font-semibold" disabled={isFull}>
              {isFull ? "Parking Full" : "Book Spot"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Book Parking Spot</DialogTitle>
              <DialogDescription>
                Reserve your spot at {location.name}.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="userName">Full Name</Label>
                  <Input 
                    id="userName" 
                    required 
                    value={formData.userName}
                    onChange={(e) => setFormData({...formData, userName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    required 
                    maxLength={10} 
                    placeholder="10 digits"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleNumber">Vehicle Registration Number</Label>
                <Input 
                  id="vehicleNumber" 
                  required 
                  placeholder="e.g. MH 01 AB 1234" 
                  className="uppercase font-mono"
                  value={formData.vehicleNumber}
                  onChange={(e) => setFormData({...formData, vehicleNumber: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input 
                    id="startTime" 
                    type="datetime-local" 
                    required 
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (Hours)</Label>
                  <Select 
                    value={formData.durationHours} 
                    onValueChange={(val) => setFormData({...formData, durationHours: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,8,12,24].map(h => (
                        <SelectItem key={h} value={h.toString()}>{h} {h === 1 ? 'Hour' : 'Hours'}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Label>Payment Mode</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.paymentMode === 'upi' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                    onClick={() => setFormData({...formData, paymentMode: 'upi'})}
                  >
                    <div className="bg-white p-1 rounded shadow-sm">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                    </div>
                    <span className="font-medium text-sm">UPI / Online</span>
                  </div>
                  <div 
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.paymentMode === 'cash' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-gray-50 dark:hover:bg-gray-900'}`}
                    onClick={() => setFormData({...formData, paymentMode: 'cash'})}
                  >
                    <div className="bg-white p-1 rounded shadow-sm">
                      <Banknote className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="font-medium text-sm">Pay at lot</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg flex justify-between items-center mt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Total Amount to Pay</p>
                  <p className="text-xs text-muted-foreground mt-1">{location.hourlyRate} × {formData.durationHours} hrs</p>
                </div>
                <div className="text-2xl font-bold font-mono text-primary flex items-center">
                  <IndianRupee className="h-5 w-5" /> 
                  {location.hourlyRate * parseInt(formData.durationHours, 10)}
                </div>
              </div>

              <DialogFooter className="pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={createBooking.isPending}>
                  {createBooking.isPending ? "Confirming..." : "Confirm Booking"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
