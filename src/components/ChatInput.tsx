'use client';

import axios from 'axios';
import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import TextareaAutosize from 'react-textarea-autosize';

import { Button } from './base/Button';

type Props = {
  chatId: string;
  chatPartner: AppUser;
};

const ChatInput = ({ chatId, chatPartner }: Props) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [input, setInput] = useState<string>('');
  const [isLoading, setLoading] = useState<boolean>(false);

  const sendMessage = async () => {
    if (!input) return;
    
    setLoading(true);

    try {
      await axios.post('/api/message/send', { text: input, chatId });
      setInput('');
      textareaRef.current?.focus();
    } catch {
      toast.error('Something went wrong')
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
        <TextareaAutosize
          ref={textareaRef}
          rows={1}
          onChange={(e) => setInput(e.target.value)}
          value={input}
          placeholder={`Message ${chatPartner.name}`}
          onKeyDown={(e) => {
            // if user pressed enter and not Shift + enter
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6"
        />

        <div onClick={() => textareaRef.current?.focus()} className="py-2" aria-hidden="true">
          <div className="py-px">
            <div className="h-9" />
          </div>
        </div>

        <div className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
          <div className="flex-shrink-0">
            <Button isLoading={isLoading} onClick={sendMessage} type="submit">
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
