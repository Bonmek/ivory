import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildOutputSettingsType, advancedOptionsType } from "@/types/CreateWebstie/types";
import { frameworks } from "@/constants/frameworks";
import { Check, AlertCircle, Info, Sparkles, File } from "lucide-react";
import { Button } from "../ui/button";

interface PreviewSummaryProps {
  name: string;
  selectedFramework: string | null;
  buildOutputSettings: buildOutputSettingsType;
  advancedOptions: advancedOptionsType;
  uploadMethod: string;
  selectedFile?: File | null;
  setOpen: (open: boolean) => void;
  setShowPreview: (showPreview: boolean) => void;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
};

export function PreviewSummary({
  name,
  selectedFramework,
  buildOutputSettings,
  advancedOptions,
  uploadMethod,
  selectedFile,
  setOpen,
  setShowPreview,
}: PreviewSummaryProps) {
  const framework = selectedFramework
    ? frameworks.find((f) => f.id === selectedFramework)
    : frameworks[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      {/* Subtle gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50 rounded-2xl -z-10" />

      <Card className="w-full border-2 border-muted/30 bg-primary-800 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl pt-8 transition-shadow duration-300 mb-4">
        <CardHeader className="border-b border-muted/20 px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
              <CardTitle className="text-3xl font-bold tracking-tight font-pixel ">
                Project Preview
              </CardTitle>
            </div>
            <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-green-500 to-teal-500 text-white text-sm font-medium shadow-md hover:shadow-lg transition-shadow">
              <Check className="h-4 w-4" />
              Ready to Deploy
            </span>
          </div>
          <p className="text-muted-foreground mt-2 text-sm tracking-wide">
            Review your project configuration before deployment
          </p>
        </CardHeader>

        <CardContent className="space-y-12 pb-2 px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/** Animated Section Block */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                custom={i}
                className={`space-y-6 ${i === 2 ? "md:col-span-2" : ""}`}
              >
                {i === 0 && (
                  <>
                    <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-3">
                      <Info className="h-5 w-5 text-blue-500 hover:scale-110 transition-transform" />
                      <h3 className="text-lg font-semibold text-foreground tracking-tight">
                        Basic Information
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      {[
                        { label: "Project Name", value: name },
                        {
                          label: "Framework",
                          value: framework?.name || "Not selected",
                        },
                        { label: "Upload Method", value: uploadMethod },
                      ].map(({ label, value }, idx) => (
                        <motion.div
                          key={idx}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={idx}
                          className="flex items-center justify-between py-2 px-3 bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">{label}</span>
                          </div>
                          <span className="text-right flex-1 font-semibold text-gray-100">{value}</span>
                        </motion.div>
                      ))}
                      {selectedFile && (
                        <motion.div
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={3}
                          className="flex items-center justify-between py-2 px-3 bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">Selected File</span>
                          </div>
                          <span className="text-right flex-1 font-semibold text-gray-100">{selectedFile.name}</span>
                        </motion.div>
                      )}
                    </div>
                  </>
                )}

                {i === 1 && (
                  <>
                    <div className="flex items-center gap-2 border-l-4 border-orange-500 pl-3">
                      <AlertCircle className="h-5 w-5 text-orange-500 hover:scale-110 transition-transform" />
                      <h3 className="text-lg font-semibold text-foreground tracking-tight">
                        Build Settings
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      {[
                        { label: "Build Command", value: buildOutputSettings.buildCommand },
                        { label: "Install Command", value: buildOutputSettings.installCommand },
                        { label: "Output Directory", value: buildOutputSettings.outputDirectory },
                      ].map(({ label, value }, idx) => (
                        <motion.div
                          key={idx}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={idx}
                          className="flex items-center justify-between py-2 px-3 bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">{label}</span>
                          </div>
                          <span className="text-right flex-1 font-semibold text-gray-100">{value || "Not set"}</span>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}

                {i === 2 && (
                  <>
                    <div className="flex items-center gap-2 border-l-4 border-purple-500 pl-3">
                      <Info className="h-5 w-5 text-purple-500 hover:scale-110 transition-transform -ml-0.5" />
                      <h3 className="text-lg font-semibold text-foreground tracking-tight">
                        Advanced Settings
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      {[
                        { label: "Cache Control", value: advancedOptions.cacheControl },
                        { label: "Default Path", value: advancedOptions.defaultPath },
                        { label: "Root Directory", value: advancedOptions.rootDirectory },
                      ].map(({ label, value }, idx) => (
                        <motion.div
                          key={idx}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={idx}
                          className="flex items-center justify-between py-2 px-3 bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">{label}</span>
                          </div>
                          <span className="text-right flex-1 font-semibold text-gray-100">{value || "Not set"}</span>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
          <section className="flex justify-end gap-4">
            <Button
              className="bg-accent hover:bg-accentHover text-accentForeground p-6 rounded-md text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/20"
              onClick={() => setShowPreview(false)}
            >
              Continue Editing
            </Button>
            <Button
              className="bg-secondary-500 hover:bg-secondary-700 text-black p-6 rounded-md text-base transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-secondary-500/20"
              onClick={() => setOpen(true)}
            >
              Deploy
            </Button>
          </section>
        </CardContent>
      </Card>
    </motion.div>
  )
}