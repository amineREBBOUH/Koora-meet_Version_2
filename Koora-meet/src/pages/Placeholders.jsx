import React from 'react';
import { Shield, Hammer } from 'lucide-react';

const PlaceholderPage = ({ title, icon: Icon = Shield }) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 border border-dashed border-gray-800 rounded-2xl bg-white/5 mt-8">
        <div className="p-6 rounded-full bg-red-600/10 mb-6">
            <Icon size={48} className="text-red-500" />
        </div>
        <h2 className="text-3xl font-black mb-2">{title}</h2>
        <p className="text-gray-400 max-w-md mb-8">
            This feature is currently under development for the World Cup 2030 launch.
            Stay tuned!
        </p>
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500 bg-black/50 px-3 py-1 rounded">
            <Hammer size={12} /> WORK IN PROGRESS
        </div>
    </div>
);

export const Teams = () => <PlaceholderPage title="Teams Stats & Squads" />;
export const Stats = () => <PlaceholderPage title="Match Statistics" />;
export const Settings = () => <PlaceholderPage title="Account Settings" />;
