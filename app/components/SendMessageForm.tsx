import React, { useState } from 'react';
import { useFetcher } from '@remix-run/react';
import { Button } from '~/components/ui/button';
import { Textarea } from '~/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/components/ui/dialog';
import ProductCard from '~/components/ProductCard';

interface SendMessageFormProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

export function SendMessageForm({ product, isOpen, onClose }: SendMessageFormProps) {
  const [message, setMessage] = useState('');
  const fetcher = useFetcher();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetcher.submit(
      { 
        productId: product.id, 
        message,
        action: 'sendMessage'
      },
      { method: 'post', action: '/api/send-message' }
    );
    setMessage('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Contact Seller</DialogTitle>
          <DialogDescription>Send a message about this product to the seller.</DialogDescription>
        </DialogHeader>
        <div className="mt-4">
          <ProductCard
            id={product.id}
            title={product.title}
            price={product.price}
            imageUrl={product.images?.[0]?.imageUrl}
          />
        </div>
        <form onSubmit={handleSubmit} className="mt-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="mb-4"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={!message.trim()}>
              Send Message
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}