import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from './ui/separator'
import { ConnectModal } from '@mysten/wallet-kit'
import { WriteBlobResponse } from '@/api/createWebsiteApi'
import { useAuth } from '@/context/AuthContext'

function CreateWebsiteDialog({
  open,
  setOpen,
  handleClickDeploy,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  handleClickDeploy: () => Promise<WriteBlobResponse>
}) {
  const [openSuiLogin, setOpenSuiLogin] = useState(false)
  const { address } = useAuth()

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className={`bg-primary-900`}>
          <div className="flex justify-center">
            <img
              src="/images/logos/Ivory.png"
              alt="Ivory Logo"
              className="w-24 h-24 object-contain"
            />
          </div>
          <DialogHeader>
            <DialogTitle className="text-2xl text-center font-bold mb-2 font-pixel">
              {address
                ? 'Create New Website'
                : 'Connect Wallet to Continue'}
            </DialogTitle>
          </DialogHeader>
          {!address ? (
            <article className="flex flex-col items-center justify-center">
              <Button
                variant="secondary"
                className="w-full h-16 flex items-center justify-start space-x-3 bg-sky-600 shadow-lg p-4 
                rounded-xl transition-all duration-200 hover:scale-105 hover:brightness-110 focus-visible:ring-4 focus-visible:ring-cyan-300 group"
                type="button"
                onClick={() => setOpenSuiLogin(true)}
              >
                <img
                  src="https://assets.crypto.ro/logos/sui-sui-logo.png"
                  className="w-10 h-10 rounded-full transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                  alt="Sui Logo"
                />
                <span className="text-lg font-bold tracking-wide">
                  Login with Sui Wallet
                </span>
              </Button>
              <section className="flex items-center justify-center w-full my-6">
                <Separator className="flex-1" />
                <span className="mx-4 text-sm text-gray-400 font-semibold select-none">
                  or
                </span>
                <Separator className="flex-1" />
              </section>
              <Button
                variant="secondary"
                className="w-full h-16 flex items-center justify-start space-x-3  hover:bg-primary-100 bg-white shadow-lg p-4 mb-4 rounded-xl transition-all duration-200 hover:scale-105 hover:brightness-110 focus-visible:ring-4 focus-visible:ring-blue-300 group"
                type="button"
              >
                <img
                  src="https://icon2.cleanpng.com/20240216/yhs/transparent-google-logo-google-logo-with-colorful-letters-on-black-1710875297222.webp"
                  className="w-10 h-10 rounded-full transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                  alt="Google Logo"
                />
                <span className="text-lg font-bold tracking-wide text-gray-900 ">
                  Login with Google
                </span>
              </Button>
            <div
              className="w-full h-16 flex items-center justify-start space-x-3 bg-blue-600/60 shadow-inner p-4 mb-4 rounded-xl opacity-60 cursor-not-allowed select-none"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6c/Facebook_Logo_2023.png"
                className="w-10 h-10 rounded-full opacity-80"
                alt="Facebook Logo"
              />
              <span className="text-lg font-bold tracking-wide text-white">
                Coming Soon
              </span>
            </div>
            </article>
          ) : (
            <article className="flex flex-col items-center justify-center">
              <div className="w-full space-y-10">
                <p className="text-white/80 text-center">
                  {/* TODO: Update text content to be more specific about Sui NS domain requirements and benefits */}
                  To create a website, you need to own a Sui NS domain. If you
                  don't have one yet, you can purchase it from our marketplace.
                </p>
                <div className="flex justify-end gap-3">
                  <Button
                    variant="secondary"
                    className="h-12 bg-secondary-500 hover:bg-secondary-700 text-black cursor-pointer"
                    onClick={() => {
                      window.open('/guide', '_blank')
                    }}
                  >
                    How to buy Sui NS
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-12 bg-primary-700 hover:bg-primary-600 text-white cursor-pointer"
                    onClick={() => {
                      handleClickDeploy()
                    }}
                  >
                    Deploy Now
                  </Button>
                </div>
              </div>
            </article>
          )}
          <DialogFooter></DialogFooter>
        </DialogContent>
      </Dialog>
      <ConnectModal
        open={openSuiLogin}
        onClose={() => setOpenSuiLogin(false)}
      />
    </>
  )
}

export default CreateWebsiteDialog
