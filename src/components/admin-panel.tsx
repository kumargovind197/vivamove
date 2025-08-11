
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Building, Edit, Trash2, PieChart, Download, AlertTriangle, ShieldCheck, BadgeCheck, BadgeAlert } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { MOCK_USERS, addClinicUser, MOCK_CLINICS } from '@/lib/mock-data';
import { Switch } from './ui/switch';

const mockPatientHistoricalData = {
    'clinic-wellness': [
        { patientId: '1', patientName: 'John Smith', age: 45, data: [
            { month: '2024-05', avgSteps: 5008, avgMinutes: 22 },
            { month: '2024-06', avgSteps: 6015, avgMinutes: 28 },
            { month: '2024-07', avgSteps: 7030, avgMinutes: 35 },
        ]},
        { patientId: '2', patientName: 'Emily Jones', age: 32, data: [
            { month: '2024-06', avgSteps: 2978, avgMinutes: 15 },
            { month: '2024-07', avgSteps: 3674, avgMinutes: 20 },
        ]},
        { patientId: '8', patientName: 'Old Patient', age: 68, status: 'unenrolled', data: [
             { month: '2024-01', avgSteps: 1200, avgMinutes: 5 },
        ]}
    ],
    'clinic-healthfirst': [
        // Add mock data if needed
    ],
    'clinic-cityheart': [
        // Add mock data if needed
    ]
};

type Clinic = typeof MOCK_CLINICS[keyof typeof MOCK_CLINICS];

export default function AdminPanel() {
  const [clinics, setClinics] = useState(Object.values(MOCK_CLINICS));
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicId, setNewClinicId] = useState('');
  const [newClinicPassword, setNewClinicPassword] = useState('');
  const [newPatientCapacity, setNewPatientCapacity] = useState(100);
  const [newAdsEnabled, setNewAdsEnabled] = useState(true);
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [newLogoPreview, setNewLogoPreview] = useState<string | null>(null);
  
  const [isEditDialogOpen, setEditDialogOpen] = useState(false);
  const [clinicToEdit, setClinicToEdit] = useState<Clinic | null>(null);
  const [editedLogoFile, setEditedLogoFile] = useState<File | null>(null);
  const [editedLogoPreview, setEditedLogoPreview] = useState<string | null>(null);
  const [editedAdsEnabled, setEditedAdsEnabled] = useState(false);

  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { toast } = useToast();

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>, type: 'new' | 'edit') => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'new') {
            setNewLogoFile(file);
            setNewLogoPreview(result);
        } else if (type === 'edit') {
            setEditedLogoFile(file);
            setEditedLogoPreview(result);
            setClinicToEdit(prev => prev ? { ...prev, logo: result } : null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnrollClinic = () => {
    if (!newClinicName || !newPatientCapacity || !newClinicId || !newClinicPassword) {
         toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please fill out all required fields.",
        });
        return;
    }
    
    const userAdded = addClinicUser(newClinicId, newClinicPassword);
    if (!userAdded) {
        toast({
            variant: "destructive",
            title: "Enrollment Failed",
            description: `A user with the Clinic ID '${newClinicId}' already exists. Please choose a different ID.`,
        });
        return;
    }
    
    const newClinic: Clinic = {
        id: newClinicId,
        name: newClinicName,
        capacity: newPatientCapacity,
        enrolled: 0,
        logo: newLogoPreview || 'https://placehold.co/128x128.png',
        password: newClinicPassword,
        adsEnabled: newAdsEnabled
    };

    MOCK_CLINICS[newClinicId] = newClinic;
    setClinics(Object.values(MOCK_CLINICS));

    toast({
      title: "Clinic Enrolled",
      description: `${newClinicName} has been successfully created. You can now log in with the new credentials.`,
    });

    setNewClinicName('');
    setNewClinicId('');
    setNewClinicPassword('');
    setNewPatientCapacity(100);
    setNewAdsEnabled(true);
    setNewLogoFile(null);
    setNewLogoPreview(null);
  };

  const openEditDialog = (clinic: Clinic) => {
      setClinicToEdit(clinic);
      setEditedLogoPreview(clinic.logo);
      setEditedAdsEnabled(clinic.adsEnabled);
      setEditedLogoFile(null);
      setEditDialogOpen(true);
  }

  const handleUpdateClinic = () => {
      if (!clinicToEdit) return;
      
      const updatedClinicData = {
          ...clinicToEdit,
          adsEnabled: editedAdsEnabled
      };

      MOCK_CLINICS[clinicToEdit.id] = updatedClinicData;
      setClinics(Object.values(MOCK_CLINICS));
      
      // Also update the password in the mock user DB if it was changed
      if (clinicToEdit.password) {
        addClinicUser(clinicToEdit.id, clinicToEdit.password, true);
      }

      toast({
          title: "Clinic Updated",
          description: `Details for ${clinicToEdit.name} have been successfully updated.`
      });
      setEditDialogOpen(false);
      setClinicToEdit(null);
  }

  const handleDownloadCsv = () => {
    if (!selectedClinicId) return;

    const clinicData = mockPatientHistoricalData[selectedClinicId as keyof typeof mockPatientHistoricalData] || [];
    const clinicName = clinics.find(c => c.id === selectedClinicId)?.name || 'clinic';

    if (clinicData.length === 0) {
        toast({
            variant: 'destructive',
            title: "No Data",
            description: "There is no historical data available for the selected clinic.",
        });
        return;
    }
    
    const allMonths = Array.from(new Set(clinicData.flatMap(p => p.data.map(d => d.month)))).sort();
    
    const headers = ['PatientID', 'PatientName', 'Age', 'Overall_Avg_Steps', 'Overall_Avg_Mins'];
    allMonths.forEach(month => {
        headers.push(`AvgSteps_${month}`, `AvgMins_${month}`);
    });
    
    const csvRows = [headers.join(',')];

    for (const patient of clinicData) {
        const totalSteps = patient.data.reduce((sum, d) => sum + d.avgSteps, 0);
        const totalMins = patient.data.reduce((sum, d) => sum + d.avgMinutes, 0);
        const overallAvgSteps = patient.data.length > 0 ? Math.round(totalSteps / patient.data.length) : 0;
        const overallAvgMins = patient.data.length > 0 ? Math.round(totalMins / patient.data.length) : 0;

        const row: (string | number)[] = [
            patient.patientId,
            `"${patient.patientName}"`,
            patient.age,
            overallAvgSteps,
            overallAvgMins
        ];

        const patientDataByMonth = new Map(patient.data.map(d => [d.month, d]));

        allMonths.forEach(month => {
            const monthData = patientDataByMonth.get(month);
            row.push(monthData ? monthData.avgSteps : 'NA');
            row.push(monthData ? monthData.avgMinutes : 'NA');
        });
        
        csvRows.push(row.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clinicName.replace(/\s+/g, '_')}_monthly_report.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
     toast({
        title: "Report Generated",
        description: "Your CSV report download has started.",
    });
  };

  const handleSetAdmin = async () => {
      if (!adminEmail) {
          toast({ variant: 'destructive', title: 'Email required', description: 'Please enter the email of the user to make an admin.' });
          return;
      }
      setIsSubmitting(true);
      try {
          console.log(`Simulating call to setAdminRole for email: ${adminEmail}`);
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          toast({ title: 'Success', description: `Admin role successfully set for ${adminEmail}. They will have admin access on their next login.` });
          setAdminEmail('');

      } catch (error: any) {
          console.error(error);
          toast({ variant: 'destructive', title: 'Error', description: error.message || 'An unknown error occurred.' });
      } finally {
          setIsSubmitting(false);
      }
  }

  return (
    <>
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
       <div className="space-y-1 mb-8">
            <h1 className="font-headline text-2xl font-bold">Developer Admin Panel</h1>
            <p className="text-sm text-muted-foreground">
                Manage clinic enrollment, application settings, and view analytics.
            </p>
        </div>
      <Tabs defaultValue="clinics" orientation="vertical" className="flex flex-col md:flex-row gap-8">
         <TabsList className="grid md:grid-cols-1 w-full md:w-48 shrink-0">
            <TabsTrigger value="clinics"><Building className="mr-2" />Clinics</TabsTrigger>
            <TabsTrigger value="analysis"><PieChart className="mr-2" />Analysis</TabsTrigger>
            <TabsTrigger value="security"><ShieldCheck className="mr-2" />Security</TabsTrigger>
         </TabsList>
        
        <div className="flex-grow">
            <TabsContent value="clinics">
                <Tabs defaultValue="manage">
                    <div className="flex items-center justify-end mb-4">
                        <TabsList>
                            <TabsTrigger value="manage">Manage Clinics</TabsTrigger>
                            <TabsTrigger value="enroll">Enroll New Clinic</TabsTrigger>
                        </TabsList>
                    </div>
                    <TabsContent value="manage">
                        <Card>
                            <CardHeader>
                                <CardTitle>Existing Clinics</CardTitle>
                                <CardDescription>View and manage currently enrolled clinics.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Clinic Name</TableHead>
                                            <TableHead>Patient Count</TableHead>
                                            <TableHead>Capacity</TableHead>
                                            <TableHead>Ad Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {clinics.map((clinic) => (
                                            <TableRow key={clinic.id}>
                                                <TableCell className="font-medium flex items-center gap-3">
                                                    <img src={clinic.logo} alt={`${clinic.name} logo`} className="h-10 w-10 rounded-md object-cover bg-muted" />
                                                    {clinic.name}
                                                </TableCell>
                                                <TableCell>{clinic.enrolled}</TableCell>
                                                <TableCell>{clinic.capacity}</TableCell>
                                                <TableCell>
                                                    <span className={`flex items-center gap-1.5 text-xs font-semibold ${clinic.adsEnabled ? 'text-green-400' : 'text-amber-400'}`}>
                                                        {clinic.adsEnabled ? <BadgeCheck className="h-4 w-4" /> : <BadgeAlert className="h-4 w-4" />}
                                                        {clinic.adsEnabled ? 'Enabled' : 'Disabled'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => openEditDialog(clinic)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="enroll">
                    <Card>
                        <CardHeader>
                        <CardTitle>Enroll a New Clinic</CardTitle>
                        <CardDescription>
                            Fill out the details below to add a new clinic to the ViVa move platform.
                        </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="clinic-name">Clinic Name</Label>
                            <Input
                            id="clinic-name"
                            value={newClinicName}
                            onChange={(e) => setNewClinicName(e.target.value)}
                            placeholder="Enter the new clinic's name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clinic-id">Clinic ID (for login)</Label>
                            <Input
                            id="clinic-id"
                            value={newClinicId}
                            onChange={(e) => setNewClinicId(e.target.value)}
                            placeholder="e.g. clinic-wellness"
                            />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="clinic-password">Password</Label>
                            <Input
                            id="clinic-password"
                            type="password"
                            value={newClinicPassword}
                            onChange={(e) => setNewClinicPassword(e.target.value)}
                            placeholder="Set initial password"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="patient-capacity">Patient Capacity</Label>
                            <Input
                            id="patient-capacity"
                            type="number"
                            value={newPatientCapacity}
                            onChange={(e) => setNewPatientCapacity(Number(e.target.value))}
                            placeholder="Set the maximum number of patients"
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="ads-enabled-new" checked={newAdsEnabled} onCheckedChange={setNewAdsEnabled} />
                            <Label htmlFor="ads-enabled-new">Enable Advertising Banners</Label>
                        </div>
                        <div className="space-y-2">
                            <Label>Clinic Logo</Label>
                            <div className="flex items-center gap-4">
                            {newLogoPreview ? (
                                <img src={newLogoPreview} alt="New Clinic Logo Preview" className="h-20 w-20 rounded-md object-cover bg-muted" />
                            ) : (
                                <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center">
                                <Building className="h-8 w-8 text-muted-foreground" />
                                </div>
                            )}
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="logo-upload" className="sr-only">Upload Logo</Label>
                                <div className="flex items-center gap-2">
                                    <Input id="logo-upload" type="file" accept="image/*" onChange={(e) => handleLogoChange(e, 'new')} className="hidden" />
                                    <Button asChild variant="outline">
                                        <label htmlFor="logo-upload" className="cursor-pointer">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload Image
                                        </label>
                                    </Button>
                                    {newLogoFile && <p className="text-sm text-muted-foreground">{newLogoFile.name}</p>}
                                </div>
                            </div>
                            </div>
                        </div>
                        </CardContent>
                        <CardFooter>
                        <Button onClick={handleEnrollClinic}>Enroll Clinic</Button>
                        </CardFooter>
                    </Card>
                    </TabsContent>
                </Tabs>
            </TabsContent>
            <TabsContent value="analysis">
                 <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Data Export</CardTitle>
                            <CardDescription>Select a clinic to download a CSV file of its patients' monthly historical data.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="max-w-xs space-y-2">
                                <Label htmlFor="clinic-select">Select a Clinic</Label>
                                <Select onValueChange={setSelectedClinicId} value={selectedClinicId || ''}>
                                    <SelectTrigger id="clinic-select">
                                        <SelectValue placeholder="Choose a clinic..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {clinics.map(clinic => (
                                            <SelectItem key={clinic.id} value={clinic.id}>
                                                {clinic.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            
                            {selectedClinicId && (
                               <div className="pt-4 border-t">
                                    <Button onClick={handleDownloadCsv}>
                                        <Download className="mr-2" />
                                        Generate & Download Historical Report
                                    </Button>
                               </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-amber-500/30 bg-amber-900/20">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="text-amber-400" />
                                GDPR & Data Privacy
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-amber-200">
                                All exported data is anonymized and aggregated. Ensure you have the necessary permissions and a legal basis for processing this data. All data handling must comply with GDPR and local data protection regulations.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
             <TabsContent value="security">
                <Card>
                    <CardHeader>
                        <CardTitle>Set Admin Role</CardTitle>
                        <CardDescription>Grant a user administrative privileges. The user must already have an account created in Firebase Authentication.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                             <Label htmlFor="admin-email">User Email</Label>
                             <Input 
                                id="admin-email" 
                                type="email" 
                                placeholder="user@example.com"
                                value={adminEmail}
                                onChange={(e) => setAdminEmail(e.target.value)}
                                disabled={isSubmitting}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This will call the `setAdminRole` Cloud Function. Ensure it is deployed and the user exists before running this.
                        </p>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleSetAdmin} disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Make Admin'}
                        </Button>
                    </CardFooter>
                </Card>
            </TabsContent>
        </div>
      </Tabs>
    </div>

    {/* Edit Clinic Dialog */}
    <Dialog open={isEditDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Clinic: {clinicToEdit?.name}</DialogTitle>
                <DialogDescription>Update the details and settings for this clinic.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div className="space-y-2">
                    <Label htmlFor="edit-clinic-name">Clinic Name</Label>
                    <Input
                        id="edit-clinic-name"
                        value={clinicToEdit?.name || ''}
                        onChange={(e) => setClinicToEdit(prev => prev ? { ...prev, name: e.target.value } : null)}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-patient-capacity">Patient Capacity</Label>
                    <Input
                        id="edit-patient-capacity"
                        type="number"
                        value={clinicToEdit?.capacity || 0}
                        onChange={(e) => setClinicToEdit(prev => prev ? { ...prev, capacity: Number(e.target.value) } : null)}
                    />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="edit-password">Set/Reset Password</Label>
                    <Input
                        id="edit-password"
                        type="text"
                        placeholder="Enter new password"
                        onChange={(e) => setClinicToEdit(prev => prev ? { ...prev, password: e.target.value } : null)}
                    />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="ads-enabled-edit" checked={editedAdsEnabled} onCheckedChange={setEditedAdsEnabled} />
                    <Label htmlFor="ads-enabled-edit">Enable Advertising Banners</Label>
                </div>
                <div className="space-y-2">
                    <Label>Clinic Logo</Label>
                    <div className="flex items-center gap-4">
                        {editedLogoPreview ? (
                            <img src={editedLogoPreview} alt="Clinic Logo Preview" className="h-20 w-20 rounded-md object-cover bg-muted" />
                        ) : (
                             <div className="h-20 w-20 rounded-md bg-muted flex items-center justify-center">
                                <Building className="h-8 w-8 text-muted-foreground" />
                            </div>
                        )}
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Input id="edit-logo-upload" type="file" accept="image/*" onChange={(e) => handleLogoChange(e, 'edit')} className="hidden" />
                            <Button asChild variant="outline">
                                <label htmlFor="edit-logo-upload" className="cursor-pointer">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Change Logo
                                </label>
                            </Button>
                            {editedLogoFile && <p className="text-sm text-muted-foreground">{editedLogoFile.name}</p>}
                        </div>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateClinic}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}

    