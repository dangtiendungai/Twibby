import Sidebar from "../../components/Sidebar";
import Button from "../../components/Button";
import TextField from "../../components/TextField";
import Checkbox from "../../components/Checkbox";

export default function SettingsPage() {
  return (
    <>
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
        <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-4 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h2>
        </div>

        <div className="p-6 space-y-8">
          {/* Account Settings */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Account
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <TextField
                id="email"
                label="Email"
                type="email"
                defaultValue="user@example.com"
                helperText="Your email address"
              />
              <TextField
                id="username"
                label="Username"
                type="text"
                defaultValue="johndoe"
                helperText="Your unique username"
              />
              <Button>Save changes</Button>
            </div>
          </section>

          {/* Profile Settings */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Profile
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <TextField
                id="name"
                label="Display Name"
                type="text"
                defaultValue="John Doe"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                  rows={4}
                  placeholder="Tell us about yourself"
                  defaultValue="Software developer, coffee enthusiast, and occasional writer."
                />
              </div>
              <Button>Update profile</Button>
            </div>
          </section>

          {/* Privacy Settings */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Privacy
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <Checkbox
                id="private-account"
                label="Make my account private"
                helperText="Only approved followers can see your tweets"
              />
              <Checkbox
                id="show-email"
                label="Show email on profile"
              />
              <Checkbox
                id="allow-tags"
                label="Allow anyone to tag me in photos"
              />
              <Button variant="outline">Save privacy settings</Button>
            </div>
          </section>

          {/* Notification Settings */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Notifications
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <Checkbox
                id="email-notifications"
                label="Email notifications"
                defaultChecked
              />
              <Checkbox
                id="push-notifications"
                label="Push notifications"
                defaultChecked
              />
              <Checkbox
                id="new-follower"
                label="New follower notifications"
                defaultChecked
              />
              <Checkbox
                id="mentions"
                label="Mentions and replies"
                defaultChecked
              />
              <Button variant="outline">Save notification settings</Button>
            </div>
          </section>

          {/* Security */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Security
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 space-y-4">
              <Button variant="outline" fullWidth>
                Change password
              </Button>
              <Button variant="outline" fullWidth>
                Two-factor authentication
              </Button>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
              Danger Zone
            </h3>
            <div className="bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-900 p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Delete your account and all of your data. This action cannot be undone.
                </p>
                <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                  Delete account
                </Button>
              </div>
            </div>
          </section>
        </div>
      </main>
      <aside className="hidden lg:block w-[240px] flex-shrink-0 p-4">
        <div className="sticky top-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-4">
            <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 mb-4">
              Quick Links
            </h3>
            <div className="space-y-2">
              <a href="#account" className="block text-sm text-blue-500 hover:text-blue-600">
                Account
              </a>
              <a href="#profile" className="block text-sm text-blue-500 hover:text-blue-600">
                Profile
              </a>
              <a href="#privacy" className="block text-sm text-blue-500 hover:text-blue-600">
                Privacy
              </a>
              <a href="#notifications" className="block text-sm text-blue-500 hover:text-blue-600">
                Notifications
              </a>
              <a href="#security" className="block text-sm text-blue-500 hover:text-blue-600">
                Security
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}


