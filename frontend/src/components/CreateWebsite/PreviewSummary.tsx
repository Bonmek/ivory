import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { buildOutputSettingsType, advancedOptionsType } from "@/types/CreateWebstie/types";
import { frameworks } from "@/constants/frameworks";
import { Check, AlertCircle, Info, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';

interface PreviewSummaryProps {
  name: string;
  selectedFramework: string | null;
  buildOutputSettings: buildOutputSettingsType;
  advancedOptions: advancedOptionsType;
  uploadMethod: string;
  selectedFile?: File | null;
  setOpen: (open: boolean) => void;
  setShowPreview: (showPreview: boolean) => void;
  selectedRepoFile?: File | null;
  showBuildOutputSettings: boolean;
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

export const PreviewSummary: React.FC<PreviewSummaryProps> = ({
  name,
  selectedFramework,
  buildOutputSettings,
  advancedOptions,
  uploadMethod,
  selectedFile,
  setOpen,
  setShowPreview,
  selectedRepoFile,
  showBuildOutputSettings,
}) => {
  const intl = useIntl();

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
      {/* Title Section */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            <h1 className="text-3xl font-bold tracking-tight font-pixel">
              <FormattedMessage id="createWebsite.previewProjectName" />
            </h1>
          </div>
        </div>
        <p className="text-muted-foreground text-sm tracking-wide">
          <FormattedMessage id="createWebsite.previewSummaryDescription" />
        </p>
      </div>

      <Card className="w-full border-2 border-muted/30 bg-primary-800 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 mb-4">
        <CardContent className="space-y-12 pb-2 px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                variants={sectionVariants}
                initial="hidden"
                animate="visible"
                custom={i}
                className={`space-y-6 ${(!showBuildOutputSettings && i === 0) || i === 2 ? "md:col-span-2" : ""}`}
              >
                {i === 0 && (
                  <>
                    <div className="flex items-center gap-2 border-l-4 border-blue-500 pl-3">
                      <Info className="h-5 w-5 text-blue-500 hover:scale-110 transition-transform" />
                      <h3 className="text-lg font-semibold text-foreground tracking-tight">
                        <FormattedMessage id="createWebsite.previewBasicInformation" />
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      {[
                        { label: intl.formatMessage({ id: "createWebsite.previewProjectName" }), value: name },
                        {
                          label: intl.formatMessage({ id: "createWebsite.previewFramework" }),
                          value: framework?.name || intl.formatMessage({ id: "createWebsite.previewNotSelected" }),
                        },
                        { label: intl.formatMessage({ id: "createWebsite.previewUploadMethod" }), value: uploadMethod },
                      ].map(({ label, value }, idx) => (
                        <motion.div
                          key={idx}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={idx}
                          className="flex flex-col gap-2 py-2 px-3 bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">{label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">•</span>
                            <span className="font-semibold text-gray-100 ml-1">{value}</span>
                          </div>
                        </motion.div>
                      ))}
                      {(uploadMethod === "upload" && selectedFile) && (
                        <motion.div
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={3}
                          className="flex flex-col gap-2 py-2 px-3 bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">
                              <FormattedMessage id="createWebsite.previewSelectedFile" />
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-green-400">•</span>
                              <span className="font-semibold text-gray-100 ml-1">{selectedFile.name}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                      {(uploadMethod === "github" && selectedRepoFile) && (
                        <motion.div
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={4}
                          className="flex flex-col gap-2 py-2 px-3 bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">
                              <FormattedMessage id="createWebsite.previewSelectedRepository" />
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              <span className="text-green-400">•</span>
                              <span className="font-semibold text-gray-100 ml-1">{selectedRepoFile.name.replace(/\.zip$/, '')}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </>
                )}

                {i === 1 && showBuildOutputSettings && (
                  <>
                    <div className="flex items-center gap-2 border-l-4 border-orange-500 pl-3">
                      <AlertCircle className="h-5 w-5 text-orange-500 hover:scale-110 transition-transform" />
                      <h3 className="text-lg font-semibold text-foreground tracking-tight">
                        <FormattedMessage id="createWebsite.previewBuildSettings" />
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      {Object.values(buildOutputSettings).every(v => !v) ? (
                        <motion.div
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={0}
                          className="flex flex-col gap-2 py-2 px-3 bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">
                              <FormattedMessage id="createWebsite.previewStatus" />
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-red-400">•</span>
                            <span className="font-semibold text-gray-100 ml-1">
                              <FormattedMessage id="createWebsite.previewNotBuilt" />
                            </span>
                          </div>
                        </motion.div>
                      ) : (
                        [
                          { label: intl.formatMessage({ id: "createWebsite.previewBuildCommand" }), value: buildOutputSettings.buildCommand },
                          { label: intl.formatMessage({ id: "createWebsite.previewInstallCommand" }), value: buildOutputSettings.installCommand },
                          { label: intl.formatMessage({ id: "createWebsite.previewOutputDirectory" }), value: buildOutputSettings.outputDirectory },
                        ].map(({ label, value }, idx) => (
                          <motion.div
                            key={idx}
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            custom={idx}
                            className="flex flex-col gap-2 py-2 px-3 bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground font-medium">{label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-green-400">•</span>
                              <span className="font-semibold text-gray-100 ml-1">{value || intl.formatMessage({ id: "createWebsite.previewNotSet" })}</span>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </>
                )}

                {i === 2 && (
                  <>
                    <div className="flex items-center gap-2 border-l-4 border-purple-500 pl-3">
                      <Info className="h-5 w-5 text-purple-500 hover:scale-110 transition-transform -ml-0.5" />
                      <h3 className="text-lg font-semibold text-foreground tracking-tight">
                        <FormattedMessage id="createWebsite.previewAdvancedSettings" />
                      </h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      {[
                        { label: intl.formatMessage({ id: "createWebsite.previewCacheControl" }), value: `${advancedOptions.cacheControl} day(s)` },
                        { label: intl.formatMessage({ id: "createWebsite.previewDefaultPath" }), value: advancedOptions.defaultPath },
                        { label: intl.formatMessage({ id: "createWebsite.previewRootDirectory" }), value: advancedOptions.rootDirectory },
                      ].map(({ label, value }, idx) => (
                        <motion.div
                          key={idx}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          custom={idx}
                          className="flex flex-col gap-2 py-2 px-3 bg-gray-800 rounded-lg hover:bg-gray-900 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground font-medium">{label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-green-400">•</span>
                            <span className="font-semibold text-gray-100 ml-1">{value || intl.formatMessage({ id: "createWebsite.previewNotSet" })}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8">
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
      </div>
    </motion.div>
  )
}