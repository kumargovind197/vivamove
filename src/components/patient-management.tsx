
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
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Skeleton } from './ui/skeleton';
import { getClinicData, getPatientsForClinic, addPatientToClinic, updatePatientInClinic, removePatientFromClinic } from '@/lib/mock-data';
import type { Patient } from '@/lib/types';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase"; 
import { getAdditionalUserInfo, getAuth, onAuthStateChanged } from 'firebase/auth';


interface PatientManagementProps {
  clinicId: string | null;
}


const getPercentageBadgeClass = (progress: number) => {
    if (progress < 40) return "bg-red-500/20 text-red-700 dark:text-red-300";
    if (progress < 70) return "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300";
    return "bg-green-500/20 text-green-700 dark:text-green-300";
};

type FilterOption = 'all' | '<30' | '30-50' | '50-80' | '>80';

const SUGGESTED_MESSAGES: Partial<Record<FilterOption, string>> = {
    '<30': "Just checking in. Remember that every single step counts, no matter how small. Let's try to build a little momentum with a short walk today. We're here to support you!",
    '30-50': "We're seeing some good effort from you! Let's focus on consistency this week and see if we can make activity a daily habit. You are on the right track—keep it up!",
    '50-80': "Great work! You are so close to hitting your goals consistently. Let's give it a final push and finish the week/month strong. We're impressed with your dedication!",
    '>80': "Fantastic effort! Your consistency and hard work are truly paying off. Keep up the amazing work and continue inspiring others!",
};

const filterPrecedence: FilterOption[] = ['<30', '30-50', '50-80', '>80', 'all'];

export default function PatientManagement({ clinicId }: PatientManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all-patients');
  const [stepFilter, setStepFilter] = useState<FilterOption>('all');
  const [minuteFilter, setMinuteFilter] = useState<FilterOption>('all');
  const [patientsData, setPatientsData] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);

  const [isAddPatientDialogOpen, setAddPatientDialogOpen] = useState(false);
  const [isEditPatientDialogOpen, setEditPatientDialogOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [patientToRemove, setPatientToRemove] = useState<Patient | null>(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [newPatient, setNewPatient] = useState({ uhid: '', firstName: '', surname: '', email: '', age: '', gender: '' });
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [isMessageDialogOpen, setMessageDialogOpen] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  const [clinicCapacity, setClinicCapacity] = useState(0);
  const { toast } = useToast();
 const [currentUser, setCurrentUser] = useState<any>(null);

 const router = useRouter();
  const auth = getAuth();


useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (user) => {
    if (!user) {
      router.push("/login"); // Not logged in
    } else {
      const userDocRef = doc(db, "userRolepatients", user.uid);
      const clinicDocRef = doc(db, "userRoleclinics", user.uid);

      // Try both collections
      const [patientSnap, clinicSnap] = await Promise.all([
        getDoc(userDocRef),
        getDoc(clinicDocRef)
      ]);

      if (clinicSnap.exists()) {
        setCurrentUser(user);
        // ✅ This is a clinic user, allow access
      } else {
        // ❌ Not a clinic user — redirect to home or show error
        toast({
          title: "Access Denied",
          description: "You are not authorized to view this page.",
          variant: "destructive",
        });
        router.push("/");
      }
    }
  });

  return () => unsubscribe();
}, [auth, router]);




  const fetchPatientsAndClinic = () => {
    if (!clinicId) return;
    setLoading(true);
    const clinic = getClinicData(clinicId);
    if (clinic) {
        setClinicCapacity(clinic.capacity);
    }
    const patients = getPatientsForClinic(clinicId);
    setPatientsData(patients);
    setLoading(false);
  };

useEffect(() => {
  if (!clinicId) return;

  const fetchPatients = async () => {
    const querySnapshot = await getDocs(collection(db, "clinics", clinicId, "patients"));
    const patientsData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setPatientsData(patientsData as Patient[]);
    setLoading(false);
  };

  fetchPatients();
}, [clinicId]);


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

        const filterByPercentage = (patientValue: number | undefined, filter: FilterOption) => {
            if (filter === 'all' || patientValue === undefined) return true;
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
  const remainingSlots = clinicCapacity - currentPatientCount;
  const isAtCapacity = clinicCapacity > 0 && currentPatientCount >= clinicCapacity;

  const handleRowClick = (e: React.MouseEvent, patientId: string) => {
    const target = e.target as HTMLElement;
    // Prevents navigation when clicking on the checkbox or action buttons
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
    const key = id.replace('-edit', ''); // remove suffix if present
    setPatientToEdit(prev => prev ? { ...prev, [key]: value } : null);
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


const handleAddPatient = async () => {
  if (!clinicId) return;
  setLoading(true);

  try {
    const patientsRef = collection(db, "clinics", clinicId, "patients");
    const docRef = await addDoc(patientsRef, {
      ...newPatient,
      age: Number(newPatient.age),
      createdAt: new Date(),
    });

    // locally bhi update kardo (age ko number banao)
    setPatientsData([
      ...patientsData,
      { ...newPatient, age: Number(newPatient.age), id: docRef.id },
    ]);

    setNewPatient({ uhid: '', firstName: '', surname: '', email: '', age: '', gender: '' });
    setAddPatientDialogOpen(false);

    toast({ title: "Success", description: "Patient added successfully" });
  } catch (error: any) {
    toast({ variant: "destructive", title: "Error", description: error.message });
  } finally {
    setLoading(false);
  }
};




const handleEditPatient = async () => {
  if (!patientToEdit || !clinicId) return;

  setLoading(true);
  try {
    const patientRef = doc(db, "clinics", clinicId, "patients", patientToEdit.id);
    await updateDoc(patientRef, {
      ...patientToEdit,
      age: Number(patientToEdit.age),
    });

    setPatientsData(patientsData.map(p =>
      p.id === patientToEdit.id ? { ...p, ...patientToEdit } : p
    ));

    setEditPatientDialogOpen(false);
    setPatientToEdit(null);

    toast({ title: "Updated", description: "Patient updated successfully" });
  } catch (error: any) {
    toast({ variant: "destructive", title: "Error", description: error.message });
  } finally {
    setLoading(false);
  }
};

const handleRemovePatient = async (patient: Patient) => {
  if (!clinicId) return;

  setLoading(true);
  try {
    await deleteDoc(doc(db, "clinics", clinicId, "patients", patient.id));
    setPatientsData(patientsData.filter(p => p.id !== patient.id));
    setPatientToRemove(null);

    toast({ title: "Deleted", description: "Patient removed successfully" });
  } catch (error: any) {
    toast({ variant: "destructive", title: "Error", description: error.message });
  } finally {
    setLoading(false);
  }
};



  const handleOpenMessageDialog = () => {
    const stepIndex = filterPrecedence.indexOf(stepFilter);
    const minuteIndex = filterPrecedence.indexOf(minuteFilter);
    
    let messageKey: FilterOption | null = null;

    if (stepFilter !== 'all' || minuteFilter !== 'all') {
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
  
  if (loading && patientsData.length === 0) {
    return (
       <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
       </div>
    )
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
                                  <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md ${getPercentageBadgeClass(patient[stepKey] || 0)}`}>
                                      {patient[stepKey] || 0}%
                                  </span>
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-md ${getPercentageBadgeClass(patient[minuteKey] || 0)}`}>
                                      {patient[minuteKey] || 0}%
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
                               <TableHead>Actions</TableHead> 
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
                                            This action cannot be undone. This will permanently remove <span className="font-semibold">{`${patient.firstName} ${patient.surname}`}</span> from your clinic's patient list.
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
                                                onClick={() => handleRemovePatient(patient)}
                                                disabled={deleteConfirmationInput !== 'delete' || loading}
                                                className={buttonVariants({ variant: "destructive" })}
                                            >
                                            {loading ? 'Removing...' : 'Proceed'}
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
                                <p className="text-lg font-bold">{currentPatientCount} / {clinicCapacity > 0 ? clinicCapacity : 'N/A'}</p>
                            </div>
                            <div className="flex justify-center">
                                 <Image 
                                    src="https://placehold.co/40x40.png" 
                                    alt="Clinic Logo Placeholder" 
                                    width={40} 
                                    height={40} 
                                    className="rounded-md"
                                    data-ai-hint="medical logo"
                                  />
                            </div>
                            <div className="text-sm text-right">
                                <p className="text-muted-foreground">Available Slots</p>
                                <p className="text-lg font-bold">{clinicCapacity > 0 ? remainingSlots : 'N/A'}</p>
                            </div>
                        </CardContent>
                        <CardFooter className='text-xs text-muted-foreground pt-0 pb-4 px-4'>
                            Clinic capacity can be changed in the clinic list.
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
                               <TableHead>Actions</TableHead> 
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredPatients.map(patient => (
                            <TableRow key={patient.id}>
                            <TableCell className="font-mono">{patient.uhid}</TableCell>
                            <TableCell className="font-medium">{`${patient.firstName} ${patient.surname}`}</TableCell>
                            <TableCell>{patient.email}</TableCell>
                               <TableHead>Actions</TableHead> 
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
                                            This action cannot be undone. This will permanently remove <span className="font-semibold">{`${patient.firstName} ${patient.surname}`}</span> from your clinic's patient list.
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
                                                onClick={() => handleRemovePatient(patient)}
                                                disabled={deleteConfirmationInput !== 'delete' || loading}
                                                className={buttonVariants({ variant: "destructive" })}
                                            >
                                            {loading ? 'Removing...' : 'Proceed'}
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
              Enter the patient's details below to enroll them in your clinic.
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
           <Button onClick={handleAddPatient} disabled={loading}>
  {loading ? "Registering..." : "Add Patient"}
</Button>

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
                  <Label htmlFor="firstName-edit" className="text-right">First Name</Label>
                  <Input id="firstName-edit" value={patientToEdit.firstName} onChange={handleEditInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="surname-edit" className="text-right">Surname</Label>
                  <Input id="surname-edit" value={patientToEdit.surname} onChange={handleEditInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email-edit" className="text-right">Email</Label>
                  <Input id="email-edit" type="email" value={patientToEdit.email} onChange={handleEditInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="age-edit" className="text-right">Age</Label>
                  <Input id="age-edit" type="number" value={patientToEdit.age} onChange={handleEditInputChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="gender-edit" className="text-right">Gender</Label>
                    <Select onValueChange={(value) => handleEditSelectChange('gender', value)} value={patientToEdit.gender}>
                        <SelectTrigger id="gender-edit" className="col-span-3">
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
                <Button onClick={handleEditPatient} disabled={loading}>{loading ? "Saving..." : "Save Changes"}</Button>
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
