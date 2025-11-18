import Sidebar from "../../../components/Sidebar";
import Button from "../../../components/Button";
import TextField from "../../../components/TextField";

export default function EditProfilePage() {
  return (
    <>
      <main className="flex-1 border-x border-gray-200 dark:border-gray-800 min-w-0">
        <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 px-4 py-4 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Edit Profile
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>
              <div>
                <Button variant="outline" size="sm">
                  Upload new picture
                </Button>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  JPG, PNG or GIF. Max size 2MB
                </p>
              </div>
            </div>
          </div>

          {/* Banner */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Banner
            </label>
            <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
              <Button variant="outline" size="sm">
                Upload banner
              </Button>
            </div>
          </div>

          {/* Form */}
          <form className="space-y-4">
            <TextField
              id="name"
              label="Name"
              type="text"
              defaultValue="John Doe"
              required
            />

            <TextField
              id="username"
              label="Username"
              type="text"
              defaultValue="johndoe"
              helperText="Your unique username"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                rows={4}
                placeholder="Tell us about yourself"
                defaultValue="Software developer, coffee enthusiast, and occasional writer. Building cool things one line of code at a time."
                maxLength={160}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                160 characters remaining
              </p>
            </div>

            <TextField
              id="location"
              label="Location"
              type="text"
              placeholder="San Francisco, CA"
            />

            <TextField
              id="website"
              label="Website"
              type="url"
              placeholder="https://example.com"
            />

            <div className="flex gap-4 pt-4">
              <Button type="submit">Save changes</Button>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
