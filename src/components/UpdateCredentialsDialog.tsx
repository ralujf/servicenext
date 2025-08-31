import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from './AuthProvider';

interface UpdateCredentialsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UpdateCredentialsDialog({ open, onOpenChange }: UpdateCredentialsDialogProps) {
  const { user, updateEmail, updatePassword, updateDisplayName } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Email update state
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  
  // Password update state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Display name update state
  const [newDisplayName, setNewDisplayName] = useState('');
  const [displayNamePassword, setDisplayNamePassword] = useState('');

  const resetForms = () => {
    setNewEmail('');
    setEmailPassword('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setNewDisplayName('');
    setDisplayNamePassword('');
  };

  const handleEmailUpdate = async () => {
    if (!newEmail || !emailPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newEmail === user?.email) {
      toast.error('New email must be different from current email');
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateEmail(newEmail, emailPassword);
      if (result.success) {
        toast.success('Email update initiated! Please check your new email for confirmation.');
        resetForms();
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Failed to update email');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    if (currentPassword === newPassword) {
      toast.error('New password must be different from current password');
      return;
    }

    setIsLoading(true);
    try {
      const result = await updatePassword(currentPassword, newPassword);
      if (result.success) {
        toast.success('Password updated successfully!');
        resetForms();
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Failed to update password');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisplayNameUpdate = async () => {
    if (!newDisplayName || !displayNamePassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newDisplayName === user?.name) {
      toast.error('New display name must be different from current name');
      return;
    }

    if (newDisplayName.trim().length < 2) {
      toast.error('Display name must be at least 2 characters long');
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateDisplayName(newDisplayName.trim(), displayNamePassword);
      if (result.success) {
        toast.success('Display name updated successfully!');
        resetForms();
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Failed to update display name');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" style={{ fontFamily: 'Chivo, sans-serif' }}>
        <DialogHeader>
          <DialogTitle style={{ fontFamily: 'Chivo, sans-serif' }}>Settings</DialogTitle>
          <DialogDescription style={{ fontFamily: 'Chivo, sans-serif' }}>
            Update your display name, email address, or password. You'll need your current password to make changes.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="display-name" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="display-name" style={{ fontFamily: 'Chivo, sans-serif' }}>Display Name</TabsTrigger>
            <TabsTrigger value="email" style={{ fontFamily: 'Chivo, sans-serif' }}>Email</TabsTrigger>
            <TabsTrigger value="password" style={{ fontFamily: 'Chivo, sans-serif' }}>Password</TabsTrigger>
          </TabsList>

          <TabsContent value="display-name" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg" style={{ fontFamily: 'Chivo, sans-serif' }}>Update Display Name</CardTitle>
                <CardDescription style={{ fontFamily: 'Chivo, sans-serif' }}>
                  Current name: {user?.name}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newDisplayName" style={{ fontFamily: 'Chivo, sans-serif' }}>New Display Name</Label>
                  <Input
                    id="newDisplayName"
                    type="text"
                    placeholder="Enter new display name"
                    value={newDisplayName}
                    onChange={(e) => setNewDisplayName(e.target.value)}
                    style={{ fontFamily: 'Chivo, sans-serif' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="displayNamePassword" style={{ fontFamily: 'Chivo, sans-serif' }}>Current Password</Label>
                  <Input
                    id="displayNamePassword"
                    type="password"
                    placeholder="Enter your current password"
                    value={displayNamePassword}
                    onChange={(e) => setDisplayNamePassword(e.target.value)}
                    style={{ fontFamily: 'Chivo, sans-serif' }}
                  />
                </div>
                <Button 
                  onClick={handleDisplayNameUpdate} 
                  disabled={isLoading || !newDisplayName || !displayNamePassword}
                  className="w-full"
                  style={{ fontFamily: 'Chivo, sans-serif' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Display Name'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg" style={{ fontFamily: 'Chivo, sans-serif' }}>Update Email Address</CardTitle>
                <CardDescription style={{ fontFamily: 'Chivo, sans-serif' }}>
                  Current email: {user?.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newEmail" style={{ fontFamily: 'Chivo, sans-serif' }}>New Email Address</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    placeholder="Enter new email address"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    style={{ fontFamily: 'Chivo, sans-serif' }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailPassword" style={{ fontFamily: 'Chivo, sans-serif' }}>Current Password</Label>
                  <Input
                    id="emailPassword"
                    type="password"
                    placeholder="Enter your current password"
                    value={emailPassword}
                    onChange={(e) => setEmailPassword(e.target.value)}
                    style={{ fontFamily: 'Chivo, sans-serif' }}
                  />
                </div>
                <Button 
                  onClick={handleEmailUpdate} 
                  disabled={isLoading || !newEmail || !emailPassword}
                  className="w-full"
                  style={{ fontFamily: 'Chivo, sans-serif' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Email'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="password" className="space-y-4 mt-4">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg" style={{ fontFamily: 'Chivo, sans-serif' }}>Update Password</CardTitle>
                <CardDescription style={{ fontFamily: 'Chivo, sans-serif' }}>
                  Enter your current password and choose a new one.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" style={{ fontFamily: 'Chivo, sans-serif' }}>Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      placeholder="Enter your current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      style={{ fontFamily: 'Chivo, sans-serif' }}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword" style={{ fontFamily: 'Chivo, sans-serif' }}>New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      placeholder="Enter new password (min. 6 characters)"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      style={{ fontFamily: 'Chivo, sans-serif' }}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" style={{ fontFamily: 'Chivo, sans-serif' }}>Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ fontFamily: 'Chivo, sans-serif' }}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={handlePasswordUpdate} 
                  disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                  className="w-full"
                  style={{ fontFamily: 'Chivo, sans-serif' }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              resetForms();
              onOpenChange(false);
            }}
            style={{ fontFamily: 'Chivo, sans-serif' }}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}