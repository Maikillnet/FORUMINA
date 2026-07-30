import { Code, Shield, Terminal, Briefcase, MessageSquare, MessageCircle, Folder, FileText, Zap, Lock, List, Activity, Award } from 'lucide-react';

export const LUCIDE_ICONS = { Code, Shield, Terminal, Briefcase, MessageSquare, MessageCircle, Folder, FileText, Zap, Lock, List, Activity, Award };

export const getIconComponent = (iconName) => LUCIDE_ICONS[iconName] || MessageSquare;
