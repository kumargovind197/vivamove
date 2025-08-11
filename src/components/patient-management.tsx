
"use client"

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from "@/components/ui/input"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, UserPlus, MessageSquare, Edit, Trash2 } from "lucide-react"
import { Button, buttonVariants } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Label } from './ui/label';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

const initialPatientsData = [
  { id: '1', uhid: 'UHID-001', firstName: 'John', surname: 'Smith', email: 'john.smith@example.com', age: 45, gender: 'Male', weeklySteps: 85, weeklyMinutes: 100, monthlySteps: 75, monthlyMinutes: 80 },
  { id: '2', uhid: 'UHID-002', firstName: 'Emily', surname: 'Jones', email: 'emily.jones@example.com', age: 32, gender: 'Female', weeklySteps: 42, weeklyMinutes: 57, monthlySteps: 55, monthlyMinutes: 65 },
  { id: '3', uhid: 'UHID-003', firstName: 'Michael', surname: 'Johnson', email: 'michael.johnson@example.com', age: 51, gender: 'Male', weeklySteps: 100, weeklyMinutes: 100, monthlySteps: 90, monthlyMinutes: 93 },
  { id: '4', uhid: 'UHID-004', firstName: 'Sarah', surname: 'Miller', email: 'sarah.miller@example.com', age: 28, gender: 'Female', weeklySteps: 28, weeklyMinutes: 14, monthlySteps: 40, monthlyMinutes: 30 },
  { id: '5', uhid: 'UHID-005', firstName: 'David', surname: 'Wilson', email: 'david.wilson@example.com', age: 67, gender: 'Male', weeklySteps: 71, weeklyMinutes: 85, monthlySteps: 65, monthlyMinutes: 70 },
  { id: '6', uhid: 'UHID-006', firstName: 'Jessica', surname: 'Brown', email: 'jessica.brown@example.com', age: 39, gender: 'Female', weeklySteps: 57, weeklyMinutes: 42, monthlySteps: 70, monthlyMinutes: 60 },
];

type Patient = typeof initialPatientsData[0];

const getPercentageBadgeClass = (progress: number) => {
    if (progress < 40) return "bg-red-500/20 text-red-300";
    if (progress < 70) return "bg-yellow-400/20 text-yellow-300";
    return "bg-green-500/20 text-green-300";
};

type FilterOption = 'all' | '<30' | '30-50' | '50-80' | '>80';

const SUGGESTED_MESSAGES: Partial<Record<FilterOption, string>> = {
    '<30': "Just checking in. Remember that every single step counts, no matter how small. Let's try to build a little momentum with a short walk today. We're here to support you!",
    '30-50': "We're seeing some good effort from you! Let's focus on consistency this week and see if we can make activity a daily habit. You are on the right track—keep it up!",
    '50-80': "Great work! You are so close to hitting your goals consistently. Let's give it a final push and finish the week/month strong. We're impressed with your dedication!",
    '>80': "Fantastic effort! Your consistency and hard work are truly paying off. Keep up the amazing work and continue inspiring others!",
};

const filterPrecedence: FilterOption[] = ['<30', '30-50', '50-80', '>80', 'all'];

export default function PatientManagement() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all-patients');
  const [stepFilter, setStepFilter] = useState<FilterOption>('all');
  const [minuteFilter, setMinuteFilter] = useState<FilterOption>('all');
  const [patientsData, setPatientsData] = useState(initialPatientsData);
  const [isAddPatientDialogOpen, setAddPatientDialogOpen] = useState(false);
  const [isEditPatientDialogOpen, setEditPatientDialogOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [patientToRemove, setPatientToRemove] = useState<Patient | null>(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [newPatient, setNewPatient] = useState({ uhid: '', firstName: '', surname: '', email: '', age: '', gender: '' });
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [isMessageDialogOpen, setMessageDialogOpen] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  
  // This would be fetched from a config or passed as a prop in a real app
  const maxPatients = 200;

  const filteredPatients = useMemo(() => {
    let patients = patientsData;

    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        patients = patients.filter(patient =>
            patient.uhid.toLowerCase().includes(lowercasedQuery) ||
            patient.firstName.toLowerCase().includes(lowercasedQuery) ||
            patient.surname.toLowerCase().includes(lowercasedQuery) ||
            patient.email.toLowerCase().includes(lowercasedQuery)
        );
    }
    
    if (activeTab === 'weekly-report' || activeTab === 'monthly-report') {
        const stepKey = activeTab === 'weekly-report' ? 'weeklySteps' : 'monthlySteps';
        const minuteKey = activeTab === 'weekly-report' ? 'weeklyMinutes' : 'monthlyMinutes';

        const filterByPercentage = (patientValue: number, filter: FilterOption) => {
            if (filter === 'all') return true;
            switch (filter) {
                case '<30': return patientValue < 30;
                case '30-50': return patientValue >= 30 && patientValue <= 50;
                case '50-80': return patientValue > 50 && patientValue <= 80;
                case '>80': return patientValue > 80;
                default: return true;
            }
        }
        
        return patients.filter(patient => 
            filterByPercentage(patient[stepKey], stepFilter) && 
            filterByPercentage(patient[minuteKey], minuteFilter)
        );
    }

    return patients;
  }, [searchQuery, patientsData, activeTab, stepFilter, minuteFilter]);
  
  // Reset selection when filters change
  useEffect(() => {
    setSelectedPatientIds([]);
  }, [searchQuery, activeTab, stepFilter, minuteFilter]);

  const currentPatientCount = patientsData.length;
  const remainingSlots = maxPatients - currentPatientCount;
  const isAtCapacity = currentPatientCount >= maxPatients;

  const handleRowClick = (e: React.MouseEvent, patientId: string) => {
    const target = e.target as HTMLElement;
    // Prevent navigation if a checkbox or the cell containing it was clicked, or an action button
    if (target.closest('td:first-child') || target.closest('[data-action-button]')) {
      return;
    }
    router.push(`/clinic/patient/${patientId}`);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewPatient(prev => ({ ...prev, [id]: value }));
  }

  const handleSelectChange = (id: string, value: string) => {
      setNewPatient(prev => ({ ...prev, [id]: value }));
  }
  
  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!patientToEdit) return;
    const { id, value } = e.target;
    setPatientToEdit(prev => prev ? { ...prev, [id]: value } : null);
  }

  const handleEditSelectChange = (id: 'gender', value: string) => {
      if (!patientToEdit) return;
      setPatientToEdit(prev => prev ? { ...prev, [id]: value } : null);
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPatientIds(filteredPatients.map(p => p.id));
    } else {
      setSelectedPatientIds([]);
    }
  };
  
  const handleSelectPatient = (patientId: string, checked: boolean) => {
    if (checked) {
      setSelectedPatientIds(prev => [...prev, patientId]);
    } else {
      setSelectedPatientIds(prev => prev.filter(id => id !== patientId));
    }
  };

  const handleAddPatient = () => {
    if (newPatient.uhid && newPatient.firstName && newPatient.surname && newPatient.email && newPatient.age && newPatient.gender) {
      const newPatientWithId = { 
          ...newPatient, 
          age: parseInt(newPatient.age),
          id: (patientsData.length + 1).toString(),
          weeklySteps: Math.floor(Math.random() * 101),
          weeklyMinutes: Math.floor(Math.random() * 101),
          monthlySteps: Math.floor(Math.random() * 101),
          monthlyMinutes: Math.floor(Math.random() * 101),
      };
      setPatientsData(prev => [...prev, newPatientWithId]);
      
      toast({
        title: "Patient Added Successfully",
        description: `${newPatient.firstName} ${newPatient.surname} has been enrolled. An invitation email would be sent.`,
      });

      setNewPatient({ uhid: '', firstName: '', surname: '', email: '', age: '', gender: '' });
      setAddPatientDialogOpen(false);
    } else {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please fill out all fields to add a patient.",
      });
    }
  }

  const handleEditPatient = () => {
      if (!patientToEdit) return;
       const updatedPatient = {
        ...patientToEdit,
        age: typeof patientToEdit.age === 'string' ? parseInt(patientToEdit.age) : patientToEdit.age,
      };
      setPatientsData(prev => prev.map(p => p.id === patientToEdit.id ? updatedPatient : p));
      toast({
          title: "Patient Details Updated",
          description: `Details for patientToEdit.firstName} ${patientToEdit.surname} have been saved.`,
      });
      setEditPatientDialogOpen(false);
      setPatientToEdit(null);
  }

  const handleRemovePatient = (patientId: string) => {
      setPatientsData(prev => prev.filter(p => p.id !== patientId));
      toast({
        title: "Patient Removed",
        description: "The patient has been successfully removed from the clinic list.",
      });
      setPatientToRemove(null);
      setDeleteConfirmationInput('');
  }


  const handleOpenMessageDialog = () => {
    const stepIndex = filterPrecedence.indexOf(stepFilter);
    const minuteIndex = filterPrecedence.indexOf(minuteFilter);
    
    let messageKey: FilterOption | null = null;

    if (stepFilter !== 'all' || minuteFilter !== 'all') {
      // Prioritize the filter for the lower performance bracket
      if (stepFilter !== 'all' && (stepIndex < minuteIndex || minuteFilter === 'all')) {
        messageKey = stepFilter;
      } else if (minuteFilter !== 'all') {
        messageKey = minuteFilter;
      }
    }

    if (messageKey && SUGGESTED_MESSAGES[messageKey]) {
      setBulkMessage(SUGGESTED_MESSAGES[messageKey] || '');
    } else {
      setBulkMessage('');
    }
    setMessageDialogOpen(true);
  }

  const handleSendBulkMessage = () => {
    if (bulkMessage.trim() && selectedPatientIds.length > 0) {
        toast({
            title: "Message Sent",
            description: `Your message has been queued to be sent to ${selectedPatientIds.length} patient(s).`
        });
        setBulkMessage('');
        setMessageDialogOpen(false);
    } else {
        toast({
            variant: 'destructive',
            title: "Error",
            description: "Cannot send an empty message.",
        });
    }
  }
  
  const renderReportTable = (data: typeof patientsData, period: 'weekly' | 'monthly') => {
      const stepKey = period === 'weekly' ? 'weeklySteps' : 'monthlySteps';
      const minuteKey = period === 'weekly' ? 'weeklyMinutes' : 'monthlyMinutes';

      return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <Button 
                  onClick={handleOpenMessageDialog}
                  disabled={selectedPatientIds.length === 0}
                >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Selected ({selectedPatientIds.length})
                </Button>
                 <div className="flex flex-col gap-4 sm:flex-row sm:gap-2">
                    <Select value={stepFilter} onValueChange={(value) => setStepFilter(value as FilterOption)}>
                        <SelectTrigger className="w-full sm:w-[220px]">
                            <SelectValue placeholder="Filter by Step Goal %" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Step Goals</SelectItem>
                            <SelectItem value="<30">{'< 30% Goal Met'}</SelectItem>
                            <SelectItem value="30-50">30% - 50% Goal Met</SelectItem>
                            <SelectItem value="50-80">50% - 80% Goal Met</SelectItem>
                            <SelectItem value=">80">{'> 80% Goal Met'}</SelectItem>
                        </SelectContent>
                    </Select>
                     <Select value={minuteFilter} onValueChange={(value) => setMinuteFilter(value as FilterOption)}>
                        <SelectTrigger className="w-full sm:w-[220px]">
                            <SelectValue placeholder="Filter by Active Time %" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Active Times</SelectItem>
                            <SelectItem value="<30">{'< 30% Goal Met'}</SelectItem>
                            <SelectItem value="30-50">30% - 50% Goal Met</SelectItem>
                            <SelectItem value="50-80">50% - 80% Goal Met</SelectItem>
                            <SelectItem value=">80">{'> 80% Goal Met'}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                               <Checkbox 
                                 checked={selectedPatientIds.length > 0 && selectedPatientIds.length === filteredPatients.length}
                                 onCheckedChange={handleSelectAll}
                                 aria-label="Select all"
                               />
                            </TableHead>
                            <TableHead>UHID</TableHead>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Step Goal %</TableHead>
                            <TableHead>Active Time %</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.length > 0 ? data.map(patient => (
                            <TableRow 
                            key={patient.id} 
                            onClick={(e) => handleRowClick(e, patient.id)}
                            className="cursor-pointer hover:bg-muted/50"
                            >
                                <TableCell>
                                    <Checkbox
                                        checked={selectedPatientIds.includes(patient.id)}
                                        onCheckedChange={(checked) => handleSelectPatient(patient.id, !!checked)}
                                        aria-label={`Select patient ${patient.firstName}`}
                                    />
                                </TableCell>
                                <TableCell className="font-mono">{patient.uhid}</TableCell>
                                <TableCell className="font-medium">{`${patient.firstName} ${patient.surname}`}</TableCell>
                                <TableCell>
                                  <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md ${getPercentageBadgeClass(patient[stepKey])}`}>
                                      {patient[stepKey]}%
                                  </span>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md ${getPercentageBadgeClass(patient[minuteKey])}`}>
                                      {patient[minuteKey]}%
                                    </span>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No patients match the current filters.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
      )
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="font-headline text-3xl font-bold tracking-tight">Patient Management</h1>
              <p className="text-muted-foreground">View, search for, and enroll your patients.</p>
            </div>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="inline-block"> 
                        <Button onClick={() => setAddPatientDialogOpen(true)} disabled={isAtCapacity}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add New Patient
                        </Button>
                    </div>
                </TooltipTrigger>
                {isAtCapacity && (
                    <TooltipContent>
                        <p>Cannot add new patients, clinic is at full capacity.</p>
                    </TooltipContent>
                )}
            </Tooltip>
        </div>

        <Tabs defaultValue="all-patients" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all-patients">All Patients</TabsTrigger>
                <TabsTrigger value="weekly-report">Weekly Report</TabsTrigger>
                <TabsTrigger value="monthly-report">Monthly Report</TabsTrigger>
                <TabsTrigger value="maintenance">Clinic List Maintenance</TabsTrigger>
            </TabsList>
            <TabsContent value="all-patients">
                 <div className="relative w-full max-w-sm mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                        placeholder="Search by UHID, name, or email..." 
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>UHID</TableHead>
                        <TableHead>First Name</TableHead>
                        <TableHead>Surname</TableHead>
                        <TableHead>Email</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map(patient => (
                        <TableRow 
                          key={patient.id} 
                          onClick={(e) => handleRowClick(e, patient.id)}
                          className="cursor-pointer hover:bg-muted/50"
                        >
                          <TableCell className="font-mono">{patient.uhid}</TableCell>
                          <TableCell className="font-medium">{patient.firstName}</TableCell>
                          <TableCell className="font-medium">{patient.surname}</TableCell>
                          <TableCell>{patient.email}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
            </TabsContent>
            <TabsContent value="weekly-report">
                {renderReportTable(filteredPatients, 'weekly')}
            </TabsContent>
            <TabsContent value="monthly-report">
                {renderReportTable(filteredPatients, 'monthly')}
            </TabsContent>
            <TabsContent value="maintenance">
                 <div className="space-y-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                            <CardTitle className='text-base font-semibold'>Clinic Capacity</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-3 items-center p-4 pt-0">
                            <div className="text-sm text-left">
                                <p className="text-muted-foreground">Enrolled / Capacity</p>
                                <p className="text-lg font-bold">{currentPatientCount} / {maxPatients}</p>
                            </div>
                            <div className="flex justify-center">
                                 <Image 
                                    src="https://placehold.co/40x40.png" 
                                    alt="Clinic Logo Placeholder" 
                                    width={40} 
                                    height={40} 
                                    className="rounded-md"
                                  />
                            </div>
                            <div className="text-sm text-right">
                                <p className="text-muted-foreground">Available Slots</p>
                                <p className="text-lg font-bold">{remainingSlots}</p>
                            </div>
                        </CardContent>
                        <CardFooter className='text-xs text-muted-foreground pt-0 pb-4 px-4'>
                            If you need more patient slots, please contact the ViVa move team.
                        </CardFooter>
                    </Card>

                    <div className="relative w-full max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search by UHID, name, or email..." 
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>UHID</TableHead>
                            <TableHead>Full Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredPatients.map(patient => (
                            <TableRow key={patient.id}>
                            <TableCell className="font-mono">{patient.uhid}</TableCell>
                            <TableCell className="font-medium">{`${patient.firstName} ${patient.surname}`}</TableCell>
                            <TableCell>{patient.email}</TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                <Button variant="outline" size="sm" data-action-button="true" onClick={() => {
                                    setPatientToEdit(patient);
                                    setEditPatientDialogOpen(true);
                                }}>
                                    <Edit className="mr-2 h-3 w-3" />
                                    Edit
                                </Button>
                                <AlertDialog onOpenChange={(open) => !open && setDeleteConfirmationInput('')}>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm" data-action-button="true" onClick={() => setPatientToRemove(patient)}>
                                            <Trash2 className="mr-2 h-3 w-3" />
                                            Remove
                                        </Button>
                                    </AlertDialogTrigger>
                                    {patientToRemove && patientToRemove.id === patient.id && (
                                        <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                            This action cannot be undone. This will permanently remove <span className="font-semibold">{`${patient.firstName} ${patient.surname}`}</span> from your clinic and revoke their access.
                                            <br/><br/>
                                            To confirm, please type <strong className="text-foreground">delete</strong> below.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <Input 
                                            id="delete-confirm"
                                            value={deleteConfirmationInput}
                                            onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                                            className="mt-2"
                                            autoFocus
                                        />
                                        <AlertDialogFooter className='mt-4'>
                                            <AlertDialogCancel onClick={() => setPatientToRemove(null)}>Cancel</AlertDialogCancel>
                                            <AlertDialogAction 
                                                onClick={() => handleRemovePatient(patient.id)}
                                                disabled={deleteConfirmationInput !== 'delete'}
                                                className={buttonVariants({ variant: "destructive" })}
                                            >
                                            Proceed
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                        </AlertDialogContent>
                                    )}
                                    </AlertDialog>
                                </div>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </div>
                </div>
            </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isAddPatientDialogOpen} onOpenChange={setAddPatientDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Enter the patient's details below to enroll them in the clinic.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="uhid" className="text-right">UHID</Label>
              <Input id="uhid" value={newPatient.uhid} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="firstName" className="text-right">First Name</Label>
              <Input id="firstName" value={newPatient.firstName} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="surname" className="text-right">Surname</Label>
              <Input id="surname" value={newPatient.surname} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" type="email" value={newPatient.email} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="age" className="text-right">Age</Label>
              <Input id="age" type="number" value={newPatient.age} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gender" className="text-right">Gender</Label>
                <Select onValueChange={(value) => handleSelectChange('gender', value)} value={newPatient.gender}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPatientDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddPatient}>Add Patient</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {patientToEdit && (
         <Dialog open={isEditPatientDialogOpen} onOpenChange={setEditPatientDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Edit Patient Details</DialogTitle>
                <DialogDescription>
                  Update the patient's information below. UHID cannot be changed.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="uhid-edit" className="text-right">UHID</Label>
                  <Input id="uhid-edit" value={patientToEdit.uhid} className="col-span-3" disabled />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">First Name</Label>
                  <Input id="firstName" value={patientToEdit.firstName} onChange={handleEditInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="surname" className="text-right">Surname</Label>
                  <Input id="surname" value={patientToEdit.surname} onChange={handleEditInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">Email</Label>
                  <Input id="email" type="email" value={patientToEdit.email} onChange={handleEditInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="age" className="text-right">Age</Label>
                  <Input id="age" type="number" value={patientToEdit.age} onChange={handleEditInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="gender" className="text-right">Gender</Label>
                    <Select onValueChange={(value) => handleEditSelectChange('gender', value)} value={patientToEdit.gender}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditPatientDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleEditPatient}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
      )}

      <Dialog open={isMessageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>Send Bulk Message</DialogTitle>
                <DialogDescription>
                    Write a message to send to the {selectedPatientIds.length} selected patient(s).
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <Textarea 
                    placeholder="Type your message here..."
                    value={bulkMessage}
                    onChange={(e) => setBulkMessage(e.target.value)}
                    rows={5}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setMessageDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSendBulkMessage}>Send Message</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
