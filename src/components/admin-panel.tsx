
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Upload, Building, Edit, Trash2, PieChart, Download, AlertTriangle, Paintbrush, Megaphone, PlusCircle, UserCog, Database, Server, UserCheck, ShieldPlus, Trash } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Switch } from './ui/switch';
import { getFirestore, collection, getDocs, doc, setDoc, addDoc, deleteDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { auth as clientAuth } from '@/lib/firebase';
import { setCustomUserClaims } from '@/app/actions';


type Ad = {
  id: string;
  imageUrl: string;
  description: string;
  targetUrl: string;
}

type Clinic = {
  id: string;
  name: string;
  logo: string;
  capacity: number;
  adsEnabled: boolean;
  email: string;
};

const DefaultVivaMoveLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
	 width="100%" viewBox="0 0 2000 385" enableBackground="new 0 0 2000 385" xmlSpace="preserve" {...props}>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="13"
	d="
M1663,165 
	C1663,188.5 1662.95,212 1663.04,235.5 
	C1663.06,239.91 1661.96,243.73 1659.07,247.18 
	C1651.31,244.44 1649.71,237.26 1647.02,230.99 
	C1639.46,213.35 1632.04,195.65 1624.47,178.01 
	C1622.6,173.67 1619.41,170.42 1615.02,168.48 
	C1609.44,173.68 1610.19,180.51 1610.58,187 
	C1611.37,200.33 1610.8,213.67 1610.98,227 
	C1611.09,234.67 1611,242.33 1611,250 
"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="13"
	d="
M1427,165 
	C1427,185.5 1427.17,206 1426.95,226.5 
	C1426.76,244.09 1413.48,253.37 1398.01,251.89 
	C1383.48,250.49 1375.71,241.3 1374.98,226.5 
	C1373.96,206.17 1374.79,185.83 1374.5,165.5 
"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"
	d="
M495.5,162.75 
	C498.44,163.79 499.37,166.28 500,169 
	C505.83,193.83 511.46,218.72 517.65,243.46 
	C519.12,249.36 518.95,250.66 526.5,250.53 
	C537.27,250.33 537.42,252.28 540.51,239.5 
	C546.31,215.49 552.2,191.51 557.92,167.48 
	C558.28,165.99 558.58,164.87 560,164.25 
"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"
	d="
M594.5,164.75 
	C597.51,170.83 598.25,177.58 599.89,184.03 
	C603.73,199.11 606.97,214.34 610.52,229.5 
	C611.74,234.69 613.3,239.8 614.46,245.01 
	C615.27,248.66 616.95,250.64 621,250.54 
	C636.28,250.19 633.42,252.66 636.94,238.48 
	C642.84,214.71 648.32,190.83 654.09,167.02 
	C654.25,166.34 654.16,164.94 655.5,164.75 
"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"
	d="
M1728,177.5 
	C1727.43,172.82 1725.71,169.23 1721.05,166.89 
	C1712.82,162.76 1704.28,161.28 1695.54,163.65 
	C1688.96,165.43 1683.9,169.49 1682.43,176.99 
	C1680.92,184.74 1683.41,191.01 1689.05,195.94 
	C1697.86,203.66 1708.49,208.76 1718,215.5 
	C1727.58,222.28 1730.31,232.28 1725.54,242.02 
	C1721.81,249.66 1715.01,251.66 1707.5,252.47 
	C1700.85,253.2 1694.66,250.97 1688.52,248.95 
	C1683.07,247.16 1680.96,242.33 1679,237.5 
"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"
	d="
M962,250.75 
	C961.45,250.21 960.68,250.15 960.43,249.02 
	C958.74,241.48 956.83,234 955,226.5 
	C954.97,226.34 955.06,226.14 954.99,226 
	C950.61,217.01 951.35,206.83 948.45,197.52 
	C945.57,188.3 943.64,178.88 941.48,169.5 
	C940.65,165.87 938.49,164.21 934.5,164.44 
	C922.6,165.11 921.71,161.18 918.41,176.98 
	C916.23,187.42 912.14,197.54 910.82,208.04 
	C909.76,216.54 906.72,224.31 904.97,232.49 
	C903.79,238.03 902.14,243.46 901.1,249.02 
	C900.7,251.14 898.83,250.65 898,251.75 
"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"
	d="
M725.5,252.25 
	C723.88,251.31 722.12,250.44 721.52,248.5 
	C718.36,238.37 718.22,227.36 712.5,218 
	C713.79,206.56 708.3,196.37 706.43,185.51 
	C705.52,180.27 703.67,175.2 702.55,169.99 
	C701.7,165.99 699.68,164.28 695.5,164.45 
	C682.35,164.98 683.52,161.52 679.55,176.51 
	C676.62,187.61 673.34,198.72 671.72,210.03 
	C669.93,222.53 664.66,234.06 663,246.5 
	C662.62,249.27 660.97,251.09 658.5,252.25 
"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="13"
	d="
M1225,177.5 
	C1222.96,173.38 1222.18,168.39 1217.01,166.48 
	C1210.21,163.97 1203.45,161.66 1195.99,162.96 
	C1191.81,163.69 1187.87,165 1184.53,167.54 
	C1176.99,173.28 1176.82,187.37 1183.99,194.51 
	C1189.42,199.91 1196.1,203.48 1202.47,207.55 
	C1207.09,210.51 1211.85,213.3 1216.02,216.97 
	C1223.1,223.21 1226.16,232.16 1223.5,239.5 
	C1220.58,247.54 1212.95,252.23 1203,252.56 
	C1198.15,252.73 1193.58,251.61 1189.01,250.45 
	C1182.23,248.72 1177.89,244.28 1176,237.5 
"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="13"
	d="
M1327,165 
	C1327,190.83 1327.06,216.67 1326.96,242.5 
	C1326.94,248.77 1327.34,250.47 1335,250.49 
	C1343.5,250.52 1352,250.5 1360.5,250.5 
"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="13"
	d="
M979,165 
	C979,190.83 979.06,216.67 978.96,242.5 
	C978.94,248.77 979.34,250.47 987,250.49 
	C995.5,250.52 1004,250.5 1012.5,250.5 
"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="13" d="M1502,165 C1502,193.33 1502,221.67 1502,250"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="13" d="M577,165 C577,193.33 577,221.67 577,250"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="13" d="M1035,167 C1035,194.67 1035,222.33 1035,250"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="13" d="M1465,167 C1465,194.67 1465,222.33 1465,250"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="7" d="M414.75,190.5 C417.19,194.95 419.08,199.63 420.5,204.5"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="13"
	d="
M887.5,164.5 
	C877.5,164.5 867.5,164.44 857.5,164.52 
	C850.7,164.58 849.87,166.11 849.96,172 
	C850.11,181.33 849.38,190.72 850.2,199.98 
	C850.85,207.4 849.81,214.66 849.97,222 
	C850.12,229.16 850.09,236.33 849.97,243.5 
	C849.88,249.46 851.25,250.32 857,250.44 
	C867.16,250.65 877.33,250.5 887.5,250.5 
"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" d="M773.5,207.5 C790.5,207.5 807.5,207.5 824.5,207.5"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" d="M1126,207.5 C1109,207.5 1092,207.5 1075,207.5"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="13"
	d="
M771,165 
	C771,175.5 770.98,186 771.01,196.5 
	C771.03,199.73 770.5,203.05 772.41,206.06 
	C772.57,206.31 772.87,207.15 772.59,208.03 
	C769.37,218.19 771.64,228.67 771.03,239 
	C770.82,242.66 771,246.33 771,250 
"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="13" d="M1073,165 C1073.85,179.15 1071.23,193.43 1074.5,207.5 C1071.23,221.57 1073.85,235.85 1073,250"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="13" d="M1128,165 C1127.15,179.15 1129.77,193.43 1126.5,207.5 C1129.77,221.57 1127.15,235.85 1128,250"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="14" d="M826.5,165.5 C825.68,179.49 828.25,193.6 825,207.5 C828.25,221.4 825.68,235.51 826.5,249.5"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" d="M672,218.5 C676.92,220.1 681.99,219.55 687,219.45 C695.5,219.27 704.06,220.39 712.5,218.5"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" d="M910.5,218.5 C924,220.07 937.5,220.17 951,218.5"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8" d="M294.5,240 C285.5,239.92 276.5,239.83 267.5,239.75"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="11" d="M883.5,204.5 C873.78,203.88 864.34,205.61 855.03,208.1 C853.97,208.39 852.99,208.25 852,208.5"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="11" d="M450,239.5 C441,239.5 432,239.5 423,239.5"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"
	d="
M1486.5,164.5 
	C1479.5,165.03 1472.44,163.49 1465.44,165.84 
	C1462.9,166.69 1460.05,164.23 1457,164.42 
	C1452.18,164.72 1447.33,164.5 1442.5,164.5 
"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12"
	d="
M1057.5,164.5 
	C1050.17,165.03 1042.79,163.59 1035.44,165.81 
	C1032.61,166.66 1029.36,164.18 1025.99,164.43 
	C1021.85,164.73 1017.67,164.5 1013.5,164.5 
"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="13"
	d="
M1553.5,163 
	C1534.94,166.49 1525.29,177.56 1522.84,196.48 
	C1521.57,206.35 1521.5,216.07 1524.14,225.46 
	C1530.3,247.44 1547.66,256.31 1567.45,250.34 
	C1578.5,247.01 1585.3,238.57 1588.47,227.49 
	C1592.29,214.19 1592.15,200.85 1588.51,187.5 
	C1584.95,174.41 1572.66,161.8 1554,163 
"/>
<path fill="none" stroke="hsl(var(--primary))" strokeLinecap="round" strokeLinejoin="round" strokeWidth="13"
	d="
M1269.5,163 
	C1248.55,165.59 1240.3,182.11 1238.99,198 
	C1238.09,208.85 1238.28,219.47 1241.9,230.03 
	C1248.71,249.94 1270.76,257.08 1288.01,248.52 
	C1297.89,243.62 1302.9,235.07 1305.41,224.98 
	C1308.47,212.7 1308.53,200.21 1304.92,188.02 
	C1301.44,176.24 1293.97,167.86 1282,164.01 
	C1278.09,162.76 1274.03,163.02 1270,163 
"/>
</svg>
);

export default function AdminPanel() {
  const [vivaMoveLogoFile, setVivaMoveLogoFile] = useState<File | null>(null);
  const [vivaMoveLogoPreview, setVivaMoveLogoPreview] = useState<string | null>(null);
  
  const [popupAds, setPopupAds] = useState<Ad[]>([]);
  const [footerAds, setFooterAds] = useState<Ad[]>([]);
  const [newPopupAd, setNewPopupAd] = useState({ imageUrl: '', description: '', targetUrl: '' });
  const [newFooterAd, setNewFooterAd] = useState({ imageUrl: '', description: '', targetUrl: '' });

  const [adToEdit, setAdToEdit] = useState<Ad | null>(null);
  const [isEditAdDialogOpen, setEditAdDialogOpen] = useState(false);
  const [editAdData, setEditAdData] = useState<{description: string, targetUrl: string, imageUrl: string}>({description: '', targetUrl: '', imageUrl: ''});
  const [editAdFileType, setEditAdFileType] = useState<'popup' | 'footer' | null>(null);
  
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(true);
  
  const [isCreateClinicDialogOpen, setCreateClinicDialogOpen] = useState(false);
  const [isEditClinicDialogOpen, setEditClinicDialogOpen] = useState(false);
  const [isCreatingClinic, setIsCreatingClinic] = useState(false);
  const [clinicToEdit, setClinicToEdit] = useState<Clinic | null>(null);
  
  const [clinicToDelete, setClinicToDelete] = useState<Clinic | null>(null);
  const [isDeletingClinic, setIsDeletingClinic] = useState(false);
  
  const [newClinic, setNewClinic] = useState({
    name: '',
    email: '',
    logo: '',
    capacity: 100,
    adsEnabled: false,
  });

  const { toast } = useToast();

  useEffect(() => {
    // Load the saved ViVa move logo from local storage on mount
    const savedLogo = localStorage.getItem('vivaMoveLogo');
    if (savedLogo) {
      setVivaMoveLogoPreview(savedLogo);
    }
    
    // Load saved ads from local storage
    const savedPopupAds = localStorage.getItem('popupAds');
    if (savedPopupAds) {
        setPopupAds(JSON.parse(savedPopupAds));
    }
    const savedFooterAds = localStorage.getItem('footerAds');
    if (savedFooterAds) {
        setFooterAds(JSON.parse(savedFooterAds));
    }
    
    fetchClinics();

  }, []);
  
  const fetchClinics = async () => {
    setIsLoadingClinics(true);
    try {
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, "clinics"));
        const clinicsData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...(doc.data() as Omit<Clinic, 'id'>)
        }));
        setClinics(clinicsData);
    } catch (error) {
        console.error("Error fetching clinics: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch clinic data.' });
    } finally {
        setIsLoadingClinics(false);
    }
  };

  const handleVivaMoveLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setVivaMoveLogoFile(file);
        setVivaMoveLogoPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVivaMoveLogoSave = () => {
    if (vivaMoveLogoPreview) {
        localStorage.setItem('vivaMoveLogo', vivaMoveLogoPreview);
        toast({
            title: "Global Logo Updated",
            description: "The ViVa move logo has been updated across the application."
        });
    } else {
         toast({
            variant: "destructive",
            title: "No Logo Selected",
            description: "Please upload a logo first."
        });
    }
  }

  const handleAdImageUpload = (e: React.ChangeEvent<HTMLInputElement>, adType: 'popup' | 'footer' | 'edit') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (adType === 'popup') {
          setNewPopupAd(prev => ({ ...prev, imageUrl: result }));
        } else if (adType === 'footer') {
          setNewFooterAd(prev => ({ ...prev, imageUrl: result }));
        } else if (adType === 'edit') {
            setEditAdData(prev => ({...prev, imageUrl: result}));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAd = (adType: 'popup' | 'footer') => {
    const adData = adType === 'popup' ? newPopupAd : newFooterAd;
    if (!adData.imageUrl || !adData.description || !adData.targetUrl) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill out all fields for the ad.' });
      return;
    }
    const newAd = { ...adData, id: new Date().toISOString() };
    let updatedAds;
    if (adType === 'popup') {
      updatedAds = [...popupAds, newAd];
      setPopupAds(updatedAds);
      setNewPopupAd({ imageUrl: '', description: '', targetUrl: '' }); // Reset form
    } else {
      updatedAds = [...footerAds, newAd];
      setFooterAds(updatedAds);
      setNewFooterAd({ imageUrl: '', description: '', targetUrl: '' }); // Reset form
    }
    localStorage.setItem(adType === 'popup' ? 'popupAds' : 'footerAds', JSON.stringify(updatedAds));
    toast({ title: 'Success', description: 'New advertisement has been added.' });
  };

  const handleRemoveAd = (adId: string, adType: 'popup' | 'footer') => {
    let updatedAds;
    if (adType === 'popup') {
        updatedAds = popupAds.filter(ad => ad.id !== adId);
        setPopupAds(updatedAds);
    } else {
        updatedAds = footerAds.filter(ad => ad.id !== adId);
        setFooterAds(updatedAds);
    }
    localStorage.setItem(adType === 'popup' ? 'popupAds' : 'footerAds', JSON.stringify(updatedAds));
    toast({ title: 'Ad Removed', description: 'The advertisement has been removed.' });
  };

  const openEditAdDialog = (ad: Ad, adType: 'popup' | 'footer') => {
    setAdToEdit(ad);
    setEditAdData({ description: ad.description, targetUrl: ad.targetUrl, imageUrl: ad.imageUrl });
    setEditAdFileType(adType);
    setEditAdDialogOpen(true);
  }

  const handleUpdateAd = () => {
    if (!adToEdit || !editAdFileType) return;

    const updatedAd = { ...adToEdit, ...editAdData };
    let currentAds: Ad[];
    let setAds: React.Dispatch<React.SetStateAction<Ad[]>>;
    let storageKey: 'popupAds' | 'footerAds';

    if (editAdFileType === 'popup') {
        currentAds = popupAds;
        setAds = setPopupAds;
        storageKey = 'popupAds';
    } else {
        currentAds = footerAds;
        setAds = setFooterAds;
        storageKey = 'footerAds';
    }

    const updatedAds = currentAds.map(ad => ad.id === adToEdit.id ? updatedAd : ad);
    setAds(updatedAds);
    localStorage.setItem(storageKey, JSON.stringify(updatedAds));
    toast({ title: 'Ad Updated', description: 'The advertisement has been successfully modified.' });
    setEditAdDialogOpen(false);
    setAdToEdit(null);
  };
  
  const handleClinicLogoSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'new' | 'edit') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'new') {
            setNewClinic(p => ({ ...p, logo: result }));
        } else {
            setClinicToEdit(p => p ? { ...p, logo: result} : null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateClinic = async () => {
    if (!newClinic.name || !newClinic.email) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Please provide at least a clinic name and email.',
      });
      return;
    }
    setIsCreatingClinic(true);
    
    try {
        const db = getFirestore();
        const placeholderLogo = 'https://placehold.co/200x80.png';
        
        // 1. Create the clinic document in Firestore
        const clinicData = {
            name: newClinic.name,
            email: newClinic.email,
            capacity: newClinic.capacity,
            adsEnabled: newClinic.adsEnabled,
            logo: newClinic.logo || placeholderLogo,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "clinics"), clinicData);

        // 2. Set the custom claim for the user.
        const claims = { clinic: true, clinicId: docRef.id };
        const claimsResult = await setCustomUserClaims(newClinic.email, claims);

        if (!claimsResult.success) {
            // If setting claims fails, we should ideally delete the created clinic document to avoid orphaned data.
            await deleteDoc(doc(db, "clinics", docRef.id));
            throw new Error(claimsResult.message || 'Failed to set user role.');
        }

        toast({
            title: 'Clinic Created Successfully',
            description: `Clinic ${newClinic.name} has been added and the user role has been set.`,
        });

        await fetchClinics(); // Re-fetch to get the latest data
        setCreateClinicDialogOpen(false);
        setNewClinic({ name: '', email: '', logo: '', capacity: 100, adsEnabled: false });

    } catch (error: any) {
      console.error("Error creating clinic:", error);
      toast({
        variant: 'destructive',
        title: 'Error Creating Clinic',
        description: error.message || 'An unexpected error occurred. The user may not exist in Authentication.',
      });
    } finally {
      setIsCreatingClinic(false);
    }
  };

  const openEditClinicDialog = (clinic: Clinic) => {
    setClinicToEdit(clinic);
    setEditClinicDialogOpen(true);
  }

  const handleUpdateClinic = async () => {
    if (!clinicToEdit) return;
    setIsCreatingClinic(true);
    
    const db = getFirestore();
    const clinicRef = doc(db, 'clinics', clinicToEdit.id);

    try {
      const { id, ...dataToSave } = clinicToEdit;
      await setDoc(clinicRef, dataToSave, { merge: true });

      setClinics(prev => prev.map(c => c.id === id ? clinicToEdit : c));
      toast({ title: 'Clinic Updated', description: `${clinicToEdit.name} has been successfully updated.` });
      setEditClinicDialogOpen(false);
      setClinicToEdit(null);
    } catch (error: any) {
      console.error("Error updating clinic:", error);
      toast({ variant: 'destructive', title: 'Update Failed', description: error.message });
    } finally {
      setIsCreatingClinic(false);
    }
  }
  
  const handleDeleteClinic = async () => {
    if (!clinicToDelete) return;
    setIsDeletingClinic(true);

    const db = getFirestore();
    const clinicRef = doc(db, 'clinics', clinicToDelete.id);

    try {
      // NOTE: This does not delete the associated Firebase Auth user or their claim.
      // In a production app, this should be handled by a backend function to ensure data consistency.
      await deleteDoc(clinicRef);
      
      setClinics(prev => prev.filter(c => c.id !== clinicToDelete.id));
      toast({ title: 'Clinic Deleted', description: `${clinicToDelete.name} has been removed.` });
      setClinicToDelete(null);
      // Close the main edit dialog when deletion is confirmed from within it
      setEditClinicDialogOpen(false); 
    } catch (error: any) {
      console.error("Error deleting clinic:", error);
      toast({ variant: 'destructive', title: 'Deletion Failed', description: error.message });
    } finally {
      setIsDeletingClinic(false);
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
            <TabsTrigger value="advertising"><Megaphone className="mr-2" />Advertising</TabsTrigger>
            <TabsTrigger value="viva-log"><Paintbrush className="mr-2" />Viva log</TabsTrigger>
         </TabsList>
        
        <div className="flex-grow">
            <TabsContent value="clinics">
                <Card>
                    <CardHeader>
                        <CardTitle>Clinic Management</CardTitle>
                        <CardDescription>
                           Enroll new clinics and view existing ones.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Button onClick={() => setCreateClinicDialogOpen(true)}>
                           <ShieldPlus className="mr-2" /> Enroll New Clinic
                        </Button>
                        
                        <div className="space-y-2">
                           <Label>Existing Clinics</Label>
                           <div className="border rounded-lg">
                                {isLoadingClinics ? (
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-4"><div className="h-10 w-10 bg-muted rounded-md animate-pulse"></div><div className="h-4 w-1/2 bg-muted rounded-md animate-pulse"></div></div>
                                        <div className="flex items-center gap-4"><div className="h-10 w-10 bg-muted rounded-md animate-pulse"></div><div className="h-4 w-2/3 bg-muted rounded-md animate-pulse"></div></div>
                                    </div>
                                ) : clinics.length > 0 ? (
                                    clinics.map(clinic => (
                                        <div key={clinic.id} className="flex items-center justify-between p-3 border-b last:border-b-0">
                                            <div className="flex items-center gap-4">
                                                <img src={clinic.logo || 'https://placehold.co/40x40.png'} alt={`${clinic.name} Logo`} className="h-10 w-10 rounded-md object-cover bg-muted"/>
                                                <div>
                                                    <p className="font-semibold text-sm">{clinic.name}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">{clinic.id}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground text-xs text-right">Capacity</p>
                                                    <p className="font-semibold">{clinic.capacity}</p>
                                                </div>
                                                <Button variant="ghost" size="icon" onClick={() => openEditClinicDialog(clinic)}>
                                                    <Edit className="h-4 w-4 text-muted-foreground"/>
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-muted-foreground p-8">No clinics have been enrolled yet.</p>
                                )}
                           </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="advertising">
                <div className="space-y-8">
                     {/* Pop-up Ad Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pop-up Banners (Square)</CardTitle>
                            <CardDescription>Manage the rotating pop-up ads. Recommended size: 400x300.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                               <Label>New Pop-up Ad</Label>
                               <div className="p-4 border rounded-md space-y-4">
                                   <Input placeholder="Description (for internal reference)" value={newPopupAd.description} onChange={(e) => setNewPopupAd(prev => ({...prev, description: e.target.value}))}/>
                                   <Input placeholder="Target URL (e.g. https://example.com)" value={newPopupAd.targetUrl} onChange={(e) => setNewPopupAd(prev => ({...prev, targetUrl: e.target.value}))}/>
                                   <Input type="file" accept="image/*" onChange={(e) => handleAdImageUpload(e, 'popup')} />
                                   <Button size="sm" onClick={() => handleAddAd('popup')}><PlusCircle className="mr-2"/>Add Pop-up Ad</Button>
                               </div>
                            </div>
                             <div className="space-y-2">
                                <Label>Current Pop-up Ads</Label>
                                <div className="border rounded-md p-2 space-y-2 max-h-60 overflow-y-auto">
                                    {popupAds.length > 0 ? popupAds.map(ad => (
                                        <div key={ad.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                            <div className="flex items-center gap-4">
                                                <img src={ad.imageUrl} alt={ad.description} className="h-12 w-12 rounded-md object-cover"/>
                                                <div>
                                                    <p className="font-semibold text-sm">{ad.description}</p>
                                                    <p className="text-xs text-muted-foreground">{ad.targetUrl}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditAdDialog(ad, 'popup')}>
                                                    <Edit className="text-muted-foreground"/>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveAd(ad.id, 'popup')}>
                                                    <Trash2 className="text-destructive"/>
                                                </Button>
                                            </div>
                                        </div>
                                    )) : <p className="text-center text-sm text-muted-foreground p-4">No pop-up ads configured.</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Footer Ad Management */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Footer Banners (Rectangle)</CardTitle>
                            <CardDescription>Manage the rotating footer ads. Recommended size: 728x90.</CardDescription>
                        </CardHeader>
                         <CardContent className="space-y-6">
                            <div className="space-y-2">
                               <Label>New Footer Ad</Label>
                               <div className="p-4 border rounded-md space-y-4">
                                   <Input placeholder="Description (for internal reference)" value={newFooterAd.description} onChange={(e) => setNewFooterAd(prev => ({...prev, description: e.target.value}))}/>
                                   <Input placeholder="Target URL (e.g. https://example.com)" value={newFooterAd.targetUrl} onChange={(e) => setNewFooterAd(prev => ({...prev, targetUrl: e.target.value}))}/>
                                   <Input type="file" accept="image/*" onChange={(e) => handleAdImageUpload(e, 'footer')} />
                                   <Button size="sm" onClick={() => handleAddAd('footer')}><PlusCircle className="mr-2"/>Add Footer Ad</Button>
                               </div>
                            </div>
                             <div className="space-y-2">
                                <Label>Current Footer Ads</Label>
                                <div className="border rounded-md p-2 space-y-2 max-h-60 overflow-y-auto">
                                    {footerAds.length > 0 ? footerAds.map(ad => (
                                        <div key={ad.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                                            <div className="flex items-center gap-4">
                                                <img src={ad.imageUrl} alt={ad.description} className="h-12 w-auto rounded-md object-contain"/>
                                                <div>
                                                    <p className="font-semibold text-sm">{ad.description}</p>
                                                    <p className="text-xs text-muted-foreground">{ad.targetUrl}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="icon" onClick={() => openEditAdDialog(ad, 'footer')}>
                                                    <Edit className="text-muted-foreground"/>
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleRemoveAd(ad.id, 'footer')}>
                                                    <Trash2 className="text-destructive"/>
                                                </Button>
                                            </div>
                                        </div>
                                    )) : <p className="text-center text-sm text-muted-foreground p-4">No footer ads configured.</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
            <TabsContent value="viva-log">
                <Card>
                    <CardHeader>
                        <CardTitle>ViVa Move Global Logo</CardTitle>
                        <CardDescription>
                            This logo appears in the header for all users. Uploading a new one will replace the default logo across the application.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         <div className="space-y-2">
                            <Label>Logo Preview</Label>
                            <div className="flex items-center gap-4">
                                {vivaMoveLogoPreview ? (
                                    <img src={vivaMoveLogoPreview} alt="ViVa Move Logo Preview" className="h-20 w-auto rounded-md object-contain bg-muted p-2" />
                                ) : (
                                    <div className="h-20 w-48 rounded-md bg-muted flex items-center justify-center">
                                        <DefaultVivaMoveLogo className="h-10 w-auto text-muted-foreground" />
                                    </div>
                                )}
                                <div className="grid w-full max-w-sm items-center gap-1.5">
                                    <Input id="viva-logo-upload" type="file" accept="image/*,.svg" onChange={handleVivaMoveLogoChange} className="hidden" />
                                    <Button asChild variant="outline">
                                        <label htmlFor="viva-logo-upload" className="cursor-pointer">
                                            <Upload className="mr-2 h-4 w-4" />
                                            Upload New Logo
                                        </label>
                                    </Button>
                                    {vivaMoveLogoFile && <p className="text-sm text-muted-foreground">{vivaMoveLogoFile.name}</p>}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleVivaMoveLogoSave}>Save Global Logo</Button>
                    </CardFooter>
                </Card>
            </TabsContent>
        </div>
      </Tabs>
    </div>
    
    {/* Edit Ad Dialog */}
    <Dialog open={isEditAdDialogOpen} onOpenChange={setEditAdDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Edit Advertisement</DialogTitle>
                <DialogDescription>Modify the details for this ad.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                 <div className="space-y-2">
                    <Label htmlFor="edit-ad-desc">Description</Label>
                    <Input id="edit-ad-desc" value={editAdData.description} onChange={(e) => setEditAdData(prev => ({...prev, description: e.target.value}))}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="edit-ad-url">Target URL</Label>
                    <Input id="edit-ad-url" value={editAdData.targetUrl} onChange={(e) => setEditAdData(prev => ({...prev, targetUrl: e.target.value}))}/>
                </div>
                <div className="space-y-2">
                    <Label>Ad Image</Label>
                    <div className="flex items-center gap-4">
                        <img src={editAdData.imageUrl} alt="Current ad" className="h-24 w-auto object-contain rounded-md bg-muted"/>
                        <Input type="file" accept="image/*" onChange={(e) => handleAdImageUpload(e, 'edit')} />
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setEditAdDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateAd}>Save Changes</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    
    {/* Create Clinic Dialog */}
    <Dialog open={isCreateClinicDialogOpen} onOpenChange={setCreateClinicDialogOpen}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Enroll New Clinic</DialogTitle>
                <DialogDescription>
                    Set up a new clinic account. This will create a Firestore document and set the user's role. The user must already exist in Firebase Authentication.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="clinic-name">Clinic Name</Label>
                    <Input id="clinic-name" value={newClinic.name} onChange={(e) => setNewClinic(p => ({...p, name: e.target.value}))} placeholder="e.g. Wellness Center" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="clinic-email">Clinic Login Email</Label>
                    <Input id="clinic-email" type="email" value={newClinic.email} onChange={(e) => setNewClinic(p => ({...p, email: e.target.value}))} placeholder="clinic@example.com" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="clinic-logo">Clinic Logo (Optional)</Label>
                    <div className="flex items-center gap-4">
                        {newClinic.logo && <img src={newClinic.logo} alt="Logo preview" className="h-10 w-10 object-cover rounded-md bg-muted"/>}
                        <Input id="clinic-logo" type="file" accept="image/*" onChange={(e) => handleClinicLogoSelect(e, 'new')} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="clinic-capacity">Patient Capacity</Label>
                    <Input id="clinic-capacity" type="number" value={newClinic.capacity} onChange={(e) => setNewClinic(p => ({...p, capacity: parseInt(e.target.value, 10) || 0}))} />
                </div>
                <div className="flex items-center space-x-2">
                    <Switch id="clinic-ads" checked={newClinic.adsEnabled} onCheckedChange={(checked) => setNewClinic(p => ({...p, adsEnabled: checked}))} />
                    <Label htmlFor="clinic-ads">Enable Advertising Module</Label>
                </div>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setCreateClinicDialogOpen(false)} disabled={isCreatingClinic}>Cancel</Button>
                <Button onClick={handleCreateClinic} disabled={isCreatingClinic}>
                    {isCreatingClinic ? "Enrolling..." : "Enroll Clinic"}
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>

    {/* Edit Clinic Dialog */}
    {clinicToEdit && (
        <Dialog open={isEditClinicDialogOpen} onOpenChange={setEditClinicDialogOpen}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Clinic Details</DialogTitle>
                    <DialogDescription>
                        Modify the details for {clinicToEdit.name}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-clinic-name">Clinic Name</Label>
                        <Input id="edit-clinic-name" value={clinicToEdit.name} onChange={(e) => setClinicToEdit(p => p ? {...p, name: e.target.value} : null)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-clinic-email">Clinic Login Email</Label>
                        <Input id="edit-clinic-email" type="email" value={clinicToEdit.email} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-clinic-logo">Clinic Logo (Optional)</Label>
                        <div className="flex items-center gap-4">
                            <img src={clinicToEdit.logo} alt="Logo preview" className="h-10 w-10 object-cover rounded-md bg-muted"/>
                            <Input id="edit-clinic-logo" type="file" accept="image/*" onChange={(e) => handleClinicLogoSelect(e, 'edit')} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-clinic-capacity">Patient Capacity</Label>
                        <Input id="edit-clinic-capacity" type="number" value={clinicToEdit.capacity} onChange={(e) => setClinicToEdit(p => p ? {...p, capacity: parseInt(e.target.value, 10) || 0} : null)} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="edit-clinic-ads" checked={clinicToEdit.adsEnabled} onCheckedChange={(checked) => setClinicToEdit(p => p ? {...p, adsEnabled: checked} : null)} />
                        <Label htmlFor="edit-clinic-ads">Enable Advertising Module</Label>
                    </div>
                </div>
                <DialogFooter className="justify-between">
                    <AlertDialog onOpenChange={(open) => { if(!open) setClinicToDelete(null) }}>
                        <AlertDialogTrigger asChild>
                             <Button variant="destructive" onClick={() => setClinicToDelete(clinicToEdit)}>
                                <Trash className="mr-2" />
                                Delete Clinic
                            </Button>
                        </AlertDialogTrigger>
                        {clinicToDelete && (
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the <strong>{clinicToDelete.name}</strong> clinic record. The associated authentication user will NOT be deleted or have their role revoked.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteClinic} disabled={isDeletingClinic}>
                                    {isDeletingClinic ? "Deleting..." : "Confirm Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                        )}
                    </AlertDialog>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => setEditClinicDialogOpen(false)} disabled={isCreatingClinic}>Cancel</Button>
                        <Button onClick={handleUpdateClinic} disabled={isCreatingClinic}>
                            {isCreatingClinic ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )}
    </>
  );
    
