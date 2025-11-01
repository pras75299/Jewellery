"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function Newsletter() {
  return (
    <section className="py-16 bg-muted">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Sign up for news & offers!
          </h3>
          <p className="text-muted-foreground mb-8">
            You may safely unsubscribe at any time
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="flex-1"
            />
            <Button type="submit" className="gap-2">
              <Mail className="h-4 w-4" />
              Subscribe
            </Button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
