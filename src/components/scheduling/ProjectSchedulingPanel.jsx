import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectSchedulingCalendar from './ProjectSchedulingCalendar';
import ContractorAvailabilityManager from './ContractorAvailabilityManager';
import CustomerBookingInterface from './CustomerBookingInterface';
import { Calendar, Clock, Users } from 'lucide-react';

export default function ProjectSchedulingPanel({ 
  scopeId, 
  contractorEmail, 
  customerEmail,
  isContractor,
  onDateSelected 
}) {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    if (onDateSelected) {
      onDateSelected(date);
    }
  };

  return (
    <div className="w-full">
      <Tabs defaultValue={isContractor ? 'availability' : 'booking'} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
          
          {isContractor && (
            <TabsTrigger value="availability" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Availability</span>
            </TabsTrigger>
          )}

          {!isContractor && (
            <TabsTrigger value="booking" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Book</span>
            </TabsTrigger>
          )}

          {/* Filler tab to keep layout consistent */}
          {isContractor && (
            <div className="hidden" />
          )}
        </TabsList>

        {/* Calendar Tab */}
        <TabsContent value="calendar" className="mt-6">
          <ProjectSchedulingCalendar
            scopeId={scopeId}
            contractorEmail={contractorEmail}
            isContractor={isContractor}
            onDateSelect={handleDateSelect}
          />
        </TabsContent>

        {/* Contractor Availability Tab */}
        {isContractor && (
          <TabsContent value="availability" className="mt-6">
            <ContractorAvailabilityManager
              scopeId={scopeId}
              contractorEmail={contractorEmail}
            />
          </TabsContent>
        )}

        {/* Customer Booking Tab */}
        {!isContractor && (
          <TabsContent value="booking" className="mt-6">
            <CustomerBookingInterface
              scopeId={scopeId}
              contractorEmail={contractorEmail}
              customerEmail={customerEmail}
              onBookingSuccess={() => handleDateSelect(selectedDate)}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}