"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
    _id: string;
    email: string;
    name: string;
    image?: string;
    bio?: string;
    createdAt: string;
}

interface EditProfileModalProps {
    profile: UserProfile;
    onClose: () => void;
    onUpdated: (updatedProfile: UserProfile) => void;
}

export default function EditProfileModal({
    profile,
    onClose,
    onUpdated,
}: EditProfileModalProps) {
    const { toast } = useToast();
    const [name, setName] = useState(profile.name || "");
    const [bio, setBio] = useState(profile.bio || "");
    const [isSaving, setIsSaving] = useState(false);

    const handleUpdate = async () => {
        setIsSaving(true);

        try {
            const res = await fetch(`/api/admin/users/${profile._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, bio }),
            });

            if (!res.ok) throw new Error("Failed to update");

            const updated = await res.json();

            toast({
                title: "Profile Updated",
                description: "User profile has been updated successfully.",
            });
            onUpdated(updated);
            onClose();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update profile.",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bio" className="text-right">
                            Bio
                        </Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpdate} disabled={isSaving}>
                        {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
