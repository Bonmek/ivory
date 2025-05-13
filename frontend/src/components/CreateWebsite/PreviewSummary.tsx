import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { buildOutputSettingsType, advancedOptionsType } from "@/types/CreateWebstie/types";
import { frameworks } from "@/constants/frameworks";
import { Check, AlertCircle, Info, Sparkles, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormattedMessage } from 'react-intl';
import { useIntl } from 'react-intl';
import { DeployingState } from "@/types/CreateWebstie/enums";
import { Link } from "react-router";
import { useRef, useEffect } from 'react';
import { ApiResponse } from "@/types/CreateWebstie/types";

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
  deployingState: DeployingState;
  deployingResponse: ApiResponse | null;
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
  deployingState,
  setOpen,
  setShowPreview,
  selectedRepoFile,
  showBuildOutputSettings,
  deployingResponse,
}) => {
  const intl = useIntl();
  const deployStatusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (deployingState === DeployingState.Deploying && deployStatusRef.current) {
      const element = deployStatusRef.current;
      const targetPosition = element.offsetTop - 100; // Adjust the offset as needed
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  }, [deployingState]);

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
      <article className="flex flex-col gap-4 mb-8">
        <AnimatePresence mode="wait">
          {deployingState === DeployingState.Deploying && (
            <motion.article
              ref={deployStatusRef}
              id="deploy-status"
              key="deploying"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="flex items-center gap-4 p-4 mb-2 rounded-lg bg-yellow-50/10 backdrop-blur-sm border border-yellow-200/50 border-gradient-to-r from-yellow-200/20 to-yellow-400/20 shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-400/50">
                <RefreshCw className="w-6 h-6 text-yellow-400 animate-spin duration-1000 ease-linear" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-yellow-500 transition-colors duration-300 group-hover:text-yellow-600">
                  <FormattedMessage
                    id="createWebsite.processingRequest"
                    defaultMessage="Processing your request..."
                  />
                </span>
                <span className="text-xs text-yellow-400/80">
                  <FormattedMessage
                    id="createWebsite.processingTime"
                    defaultMessage="This may take a few moments"
                  />
                </span>
              </div>
            </motion.article>
          )}
          {deployingState === DeployingState.Failed && deployingResponse && (
            <motion.article
              key="failed"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="flex items-center gap-4 p-4 mb-2 rounded-lg bg-red-50/10 backdrop-blur-sm border border-red-200/50 border-gradient-to-r from-red-200/20 to-red-400/20 shadow-sm transition-all duration-300 hover:shadow-md"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/10 border border-red-400/50">
                <X className="w-6 h-6 text-red-400 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-red-500 transition-colors duration-300 group-hover:text-red-600">
                  <FormattedMessage
                    id="createWebsite.failedToDeploy"
                    defaultMessage="Failed to deploy"
                  />
                </span>
                <span className="text-xs text-red-400/80">
                  <FormattedMessage
                    id="createWebsite.failedToDeployDescription"
                    defaultMessage="Please try again or contact support for assistance."
                  />
                </span>
                {deployingResponse && deployingResponse.statusCode === 0 && (
                  <span className="text-xs text-red-400/80">
                    {deployingResponse.error.error_message}
                  </span>
                )}
              </div>
            </motion.article>
          )}
          {deployingState === DeployingState.Deployed && deployingResponse && (
            <motion.article
              key="deployed"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="flex flex-col gap-3 p-4 mb-2 rounded-lg bg-primary-50/20 backdrop-blur-sm border border-primary-100/50 shadow-sm transition-all duration-300 hover:shadow-md hover:border-primary-200/50"
            >
              <section className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10 border border-green-400/50">
                  <Check className="w-5 h-5 text-green-400 transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="text-sm font-medium text-green-500 transition-colors duration-300 group-hover:text-green-600">
                  <FormattedMessage
                    id="createWebsite.createdSuccessfully"
                    defaultMessage="Created successfully!"
                  />
                </span>
              </section>
              <span className="text-sm text-green-500 transition-colors duration-300 group-hover:text-green-600">
                <FormattedMessage
                  id="createWebsite.viewDashboard"
                  defaultMessage="You can now see your deploying status at {dashboardLink}"
                  values={{
                    dashboardLink: (
                      <Link
                        to="/dashboard"
                        className="font-medium underline underline-offset-2 hover:text-green-600 transition-colors duration-300"
                      >
                        Dashboard
                      </Link>
                    )
                  }}
                />
              </span>
            </motion.article>
          )}
        </AnimatePresence>
        <section className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
            <h1 className="text-3xl font-bold tracking-tight font-pixel">
              <FormattedMessage id="createWebsite.previewProjectName" />
            </h1>
          </div>
        </section>
        <p className="text-muted-foreground text-sm tracking-wide">
          <FormattedMessage id="createWebsite.previewSummaryDescription" />
        </p>
      </article>

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
      {deployingState === DeployingState.None && (
        <div className="flex justify-end gap-4 mt-8">
          <Button
            className="bg-accent hover:bg-accentHover text-accentForeground p-6 rounded-md text-base font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/20"
            onClick={() => { setShowPreview(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            <FormattedMessage
              id="createWebsite.continueEditing"
              defaultMessage="Continue Editing"
            />
          </Button>
          <Button
            className="bg-secondary-500 hover:bg-secondary-700 text-black p-6 rounded-md text-base transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-secondary-500/20"
            onClick={() => {
              setOpen(true);
            }}
          >
            <FormattedMessage
              id="createWebsite.deploy"
              defaultMessage="Deploy"
            />
          </Button>
        </div>
      )}
    </motion.div>
  )
}