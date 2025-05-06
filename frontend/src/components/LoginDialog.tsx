import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "./ui/separator";
import { ConnectModal, useWalletKit } from '@mysten/wallet-kit';


function LoginDialog({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const [openSuiLogin, setOpenSuiLogin] = useState(false);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-primary-900">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center font-bold mb-2 font-pixel">Connect With</DialogTitle>
          </DialogHeader>
          <article className="flex flex-col items-center justify-center">
            {/* Sui Wallet Login Button */}

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
              <span className="text-lg font-bold tracking-wide">Sui Wallet</span>
            </Button>
            <section className="flex items-center justify-center w-full my-6">
              <Separator className="flex-1" />
              <span className="mx-4 text-sm text-gray-400 font-semibold select-none">or</span>
              <Separator className="flex-1" />
            </section>
            {/* Google Login Button */}
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
              <span className="text-lg font-bold tracking-wide text-gray-900 ">Login with Google</span>
            </Button>
            {/* Facebook Login Button */}
            <Button
              variant="secondary"
              className="w-full h-16 flex items-center justify-start space-x-3 bg-blue-600/90 shadow-lg p-4 mb-4 rounded-xl transition-all duration-200 hover:scale-105 hover:brightness-110 focus-visible:ring-4 focus-visible:ring-blue-400 group"
              type="button"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6c/Facebook_Logo_2023.png"
                className="w-10 h-10 rounded-full transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                alt="Facebook Logo"
              />
              <span className="text-lg font-bold tracking-wide text-white">Login with Facebook</span>
            </Button>
          </article>
          <DialogFooter>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConnectModal
        open={openSuiLogin}
        onClose={() => setOpenSuiLogin(false)}
      />
    </>
  );
}

export default LoginDialog;
